const express = require("express");
const cors = require("cors");
const sharp = require("sharp");

const app = express();

// Enable CORS for frontend requests
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// --------------------
// HEALTH
// --------------------
app.get("/health", (req, res) => res.status(200).send("ok"));

// Alias route (so the frontend /auth/me doesn't 404)
app.get("/auth/me", (req, res) => {
  res.json({ success: false, user: null });
});

// --------------------
// LOGO RESOLVER (SQUARE ICON ONLY) + CACHE
// --------------------
const logoCache = new Map(); // domain -> { url, width, height, confidence, source, ts }
const LOGO_CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

function nowMs() {
  return Date.now();
}

function safeDomainFromUrl(url) {
  try {
    const hostname = String(url || "")
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .trim();
    return hostname || "";
  } catch {
    return "";
  }
}

function absUrl(base, href) {
  try {
    return new URL(href, base).toString();
  } catch {
    return "";
  }
}

function pickBestCandidate(cands) {
  // cands: [{ url, width, height, source, score }]
  if (!Array.isArray(cands) || cands.length === 0) return null;
  cands.sort((a, b) => (b.score || 0) - (a.score || 0));
  return cands[0];
}

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(t);
  }
}

async function getImageMetaSquare(url) {
  // returns { ok, width, height } only if square and big enough
  try {
    const resp = await fetchWithTimeout(url, 6000);
    if (!resp.ok) return { ok: false };

    const buf = Buffer.from(await resp.arrayBuffer());
    const meta = await sharp(buf).metadata();
    const w = meta?.width || 0;
    const h = meta?.height || 0;

    // STRICT: must be square (1px tolerance) and at least 128
    const square = Math.abs(w - h) <= 1;
    const bigEnough = w >= 128 && h >= 128;

    if (!square || !bigEnough) return { ok: false };
    return { ok: true, width: w, height: h };
  } catch {
    return { ok: false };
  }
}

function parseLinkTagsForIcons(html, pageUrl) {
  // returns array of candidate URLs (absolute)
  const out = [];

  // apple-touch-icon
  {
    const re = /<link[^>]*rel=["']apple-touch-icon[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = re.exec(html))) {
      const href = m[1];
      const u = absUrl(pageUrl, href);
      if (u) out.push({ url: u, source: "apple-touch-icon" });
    }
  }

  // rel="icon" or rel="shortcut icon"
  {
    const re = /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = re.exec(html))) {
      const href = m[1];
      const u = absUrl(pageUrl, href);
      if (u) out.push({ url: u, source: "link-icon" });
    }
  }

  // manifest
  {
    const re = /<link[^>]*rel=["']manifest["'][^>]*href=["']([^"']+)["'][^>]*>/i;
    const m = re.exec(html);
    if (m && m[1]) {
      const u = absUrl(pageUrl, m[1]);
      if (u) out.push({ url: u, source: "manifest" });
    }
  }

  return out;
}

async function parseManifestForIcons(manifestUrl) {
  // returns candidate icon URLs from manifest (absolute to manifestUrl)
  try {
    const resp = await fetchWithTimeout(manifestUrl, 6000);
    if (!resp.ok) return [];
    const text = await resp.text();
    const json = JSON.parse(text);

    const icons = Array.isArray(json?.icons) ? json.icons : [];
    const out = [];

    for (const ic of icons) {
      const src = ic?.src;
      const sizes = String(ic?.sizes || "");
      // Prefer explicit square sizes like 192x192, 512x512
      const squareSize = sizes.match(/(\d+)\s*x\s*\1/);
      if (src && squareSize) {
        const u = absUrl(manifestUrl, src);
        if (u) out.push({ url: u, source: "manifest-icon" });
      }
    }

    return out;
  } catch {
    return [];
  }
}

async function resolveSquareIconLogo(domain) {
  // Cache hit
  const cached = logoCache.get(domain);
  if (cached && nowMs() - cached.ts < LOGO_CACHE_TTL_MS) return cached;

  const homepage = `https://${domain}/`;
  const candidates = [];

  // 1) Try homepage HTML link tags + manifest
  try {
    const resp = await fetchWithTimeout(homepage, 6000);
    if (resp.ok) {
      const html = await resp.text();
      const parsed = parseLinkTagsForIcons(html, homepage);

      // If manifest found, expand it
      for (const p of parsed) {
        if (p.source === "manifest") {
          const manIcons = await parseManifestForIcons(p.url);
          for (const mi of manIcons) candidates.push(mi);
        } else {
          candidates.push(p);
        }
      }
    }
  } catch {
    // ignore
  }

  // 2) Add common icon locations (some sites host high-res app icons here)
  candidates.push({ url: `https://${domain}/apple-touch-icon.png`, source: "guess-apple-touch-icon" });
  candidates.push({ url: `https://${domain}/android-chrome-192x192.png`, source: "guess-android-192" });
  candidates.push({ url: `https://${domain}/android-chrome-512x512.png`, source: "guess-android-512" });
  candidates.push({ url: `https://${domain}/favicon-32x32.png`, source: "guess-favicon-32" });
  candidates.push({ url: `https://${domain}/favicon-16x16.png`, source: "guess-favicon-16" });
  candidates.push({ url: `https://${domain}/favicon.ico`, source: "guess-favicon-ico" });

  // Dedupe by URL
  const seen = new Set();
  const uniq = [];
  for (const c of candidates) {
    if (!c?.url) continue;
    if (seen.has(c.url)) continue;
    seen.add(c.url);
    uniq.push(c);
  }

  // Evaluate candidates (square + >=128). Score by size and source preference.
  const evaluated = [];
  for (const c of uniq) {
    const meta = await getImageMetaSquare(c.url);
    if (!meta.ok) continue;

    const sizeScore = Math.min(meta.width, meta.height); // larger is better
    const sourceBoost =
      c.source === "manifest-icon" ? 4000 :
      c.source === "apple-touch-icon" ? 3000 :
      c.source === "guess-android-512" ? 2500 :
      c.source === "guess-android-192" ? 2000 :
      c.source === "link-icon" ? 1500 :
      c.source === "guess-apple-touch-icon" ? 1200 :
      0;

    evaluated.push({
      url: c.url,
      width: meta.width,
      height: meta.height,
      source: c.source,
      score: sourceBoost + sizeScore
    });
  }

  const best = pickBestCandidate(evaluated);

  // If nothing square and big enough: fallback to frontend-provided /logo.png
  if (!best) {
    const fallback = {
      url: "/logo.png",
      width: 0,
      height: 0,
      source: "fallback-uploaded-logo.png",
      confidence: "none",
      ts: nowMs()
    };
    logoCache.set(domain, fallback);
    return fallback;
  }

  const resolved = {
    url: best.url,
    width: best.width,
    height: best.height,
    source: best.source,
    confidence: best.width >= 256 ? "high" : "medium",
    ts: nowMs()
  };

  logoCache.set(domain, resolved);
  return resolved;
}

// Optional debugging endpoint (safe to keep)
app.get("/api/logo/resolve", async (req, res) => {
  const domain = String(req.query.domain || "").trim().replace(/^www\./, "");
  if (!domain) return res.status(400).json({ error: "Missing domain" });
  const result = await resolveSquareIconLogo(domain);
  return res.json({ domain, ...result });
});

// --------------------
// HELPERS
// --------------------
async function buildIcpResponse(url) {
  let companyName = "COMPANY";
  let domain = "company.com";

  try {
    const hostname = String(url || "")
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];

    domain = hostname || domain;
    companyName = (hostname.split(".")[0] || companyName).toUpperCase();
  } catch (e) {}

  // Resolve square logo icon fast (with safe fallback to /logo.png)
  const logo = await resolveSquareIconLogo(domain);

  return {
    company: {
      name: companyName,
      domain,
      logoUrl: logo.url, // IMPORTANT: will be absolute icon URL OR "/logo.png" fallback
      brandColor: "#FF0000",
    },
    persona: {
      title: "VP of Sales",
      seniority: "Executive",
      department: "Sales",
      primaryGoal: "Increase Revenue Efficiency",
    },
    painPoints: [
      { title: "Inconsistent messaging across team", description: "Reps saying different things." },
      { title: "Manual data entry overhead", description: "Wasting time in CRM." },
      { title: "Low outbound conversion rates", description: "Hard to break through noise." },
      { title: "Long sales cycles", description: "Deals stalling in pipeline." },
    ],
    valueProposition: {
      headline: "Automate your entire sales pipeline.",
      subHeadline: "From lead gen to closed-won, without the manual grunt work.",
      keyBenefits: ["Higher Conversion", "Lower CAC", "Faster Velocity"],
    },
    outreach: {
      positioning: "Strategic Growth Partner",
      sampleMessage: `I noticed ${companyName} is scaling rapidly. Most leaders I speak with struggle to maintain outbound consistency during growth phases. This engine solves that.`,
    },
  };
}

// --------------------
// ROUTES
// --------------------

// IMPORTANT: support BOTH endpoints.
// Frontend may call /analysis/icp OR /api/analysis/icp

app.post("/analysis/icp", async (req, res) => {
  console.log("🟪 BACKEND: Processing /analysis/icp for", req.body?.url);
  const data = await buildIcpResponse(req.body?.url);
  res.json(data);
});

app.post("/api/analysis/icp", async (req, res) => {
  console.log("🟪 BACKEND: Processing /api/analysis/icp for", req.body?.url);
  const data = await buildIcpResponse(req.body?.url);
  res.json(data);
});

// Gemini Service Endpoints (used by OnboardingWizard)
app.post("/api/gemini/analyze", (req, res) => {
  res.json({
    positioning: "Automated Sales Infrastructure",
    offer: "End-to-end outbound automation",
    icp_hint: "B2B SaaS Companies",
    trust: ["SOC2 Compliant", "Enterprise Ready"],
  });
});

app.post("/api/gemini/icp", (req, res) => {
  res.json({
    title: "Head of Sales",
    description: "Decision maker focused on revenue efficiency.",
    industries: ["SaaS", "Fintech", "Healthtech"],
    geography: ["North America", "Europe"],
    companySize: ["50-200", "200-500"],
    roles: ["VP Sales", "CRO", "Director of Sales Ops"],
    painPoints: ["High CAC", "SDR turnover", "Pipeline unpredictability"],
  });
});

// Auth Endpoints (support /api/* and non-/api/* to avoid 404 noise)
app.get("/api/auth/me", (req, res) => res.json({ success: false, user: null }));

app.post("/api/auth/login", (req, res) => {
  const { email } = req.body || {};
  res.json({
    success: true,
    user: {
      id: "123",
      email,
      firstName: "Demo",
      lastName: "User",
      role: "admin",
      tier: "full",
    },
  });
});

app.post("/api/auth/register", (req, res) => res.json({ success: true }));

// Start Server (Render uses process.env.PORT)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
