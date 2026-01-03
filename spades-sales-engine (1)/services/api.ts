const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_BASE = RAW_BASE.replace(/\/+$/, "");
const withBase = (path: string) => (API_BASE ? `${API_BASE}${path}` : path);

// ================================
// UNIVERSAL FRONTEND API CLIENT
// Deterministic + Schema-Safe
// ================================

function withTimeout(ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { controller, cleanup: () => clearTimeout(id) };
}

async function safeJson(resp: Response) {
  const text = await resp.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function isNonEmptyString(x: any) {
  return typeof x === "string" && x.trim().length > 0;
}

function normalizePainPoints(
  input: any,
  fallback: Array<{ title: string; description: string }>
) {
  const out: Array<{ title: string; description: string }> = [];

  if (Array.isArray(input)) {
    for (const p of input) {
      if (typeof p === "string" && p.trim()) {
        out.push({
          title: p.trim().slice(0, 60),
          description: "This creates delays, uncertainty, and lower conversion for sales teams.",
        });
        continue;
      }

      if (p && typeof p === "object") {
        const title = typeof p.title === "string" ? p.title.trim() : "";
        const description =
          typeof p.description === "string" ? p.description.trim() : "";

        if (title) {
          out.push({
            title: title.slice(0, 60),
            description:
              description ||
              "This creates delays, uncertainty, and lower conversion for sales teams.",
          });
        }
      }
    }
  }

  // Ensure minimum 3 items, prefer existing, then fallback, then a generic fill
  const usedTitles = new Set(out.map((x) => x.title));

  for (const fp of fallback) {
    if (out.length >= 3) break;
    if (!usedTitles.has(fp.title)) {
      out.push(fp);
      usedTitles.add(fp.title);
    }
  }

  while (out.length < 3) {
    out.push({
      title: "Manual research overhead",
      description: "This creates delays, uncertainty, and lower conversion for sales teams.",
    });
  }

  return out.slice(0, 6);
}

function makeFallbackIcp(url?: string) {
  let derivedName = "Company";
  let domain = "unknown.com";
  if (url) {
    try {
      const clean = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
      derivedName = clean.split(".")[0]?.toUpperCase() || derivedName;
      domain = clean.split("/")[0] || domain;
    } catch {}
  }
  return {
    company: { name: derivedName, domain, logoUrl: "/logo.png", brandColor: "#6C47FF" },
    persona: { title: "Head of Sales", seniority: "Executive", department: "Sales", primaryGoal: "Growth" },
    painPoints: [
      { title: "Manual qualification overhead", description: "Creates delays and lower conversion." },
      { title: "Low outbound conversion", description: "Creates delays and lower conversion." },
      { title: "Data fragmentation", description: "Creates delays and lower conversion." }
    ],
    valueProposition: { headline: `Growth for ${derivedName}`, subHeadline: "Pipeline on autopilot.", keyBenefits: ["Speed", "Scale", "Accuracy"] },
    outreach: { positioning: "Strategic Partner", sampleMessage: "Hi, noticed your growth..." }
  };
}

function isValidIcpPayload(p: any) {
  if (!p || typeof p !== "object") return false;

  if (!p.company || typeof p.company !== "object") return false;
  if (!p.persona || typeof p.persona !== "object") return false;
  if (!p.valueProposition || typeof p.valueProposition !== "object") return false;
  if (!p.outreach || typeof p.outreach !== "object") return false;

  if (!Array.isArray(p.painPoints) || p.painPoints.length < 3) return false;
  for (const pp of p.painPoints) {
    if (!pp || typeof pp !== "object") return false;
    if (!isNonEmptyString(pp.title)) return false;
    if (!isNonEmptyString(pp.description)) return false;
  }

  return true;
}

function coerceToIcpSchema(raw: any, urlStr?: string) {
  const fb = makeFallbackIcp(urlStr);
  if (isValidIcpPayload(raw)) return raw;

  const normalized = {
    company: {
      name: raw?.company?.name || raw?.companyName || fb.company.name,
      domain: raw?.company?.domain || fb.company.domain,
      logoUrl: raw?.company?.logoUrl || fb.company.logoUrl,
      brandColor: raw?.company?.brandColor || fb.company.brandColor
    },
    persona: {
      title: raw?.persona?.title || fb.persona.title,
      seniority: raw?.persona?.seniority || fb.persona.seniority,
      department: "Sales",
      primaryGoal: "Growth"
    },
    painPoints: normalizePainPoints(raw?.painPoints, fb.painPoints),
    valueProposition: {
      headline: raw?.valueProposition?.headline || fb.valueProposition.headline,
      subHeadline: raw?.valueProposition?.subHeadline || fb.valueProposition.subHeadline,
      keyBenefits: raw?.valueProposition?.keyBenefits || fb.valueProposition.keyBenefits
    },
    outreach: {
      positioning: raw?.outreach?.positioning || fb.outreach.positioning,
      sampleMessage: raw?.outreach?.sampleMessage || fb.outreach.sampleMessage
    }
  };

  return isValidIcpPayload(normalized) ? normalized : fb;
}

export const api = {
  async post<T>(path: string, body: any): Promise<T> {
    if (path === "/analysis/icp" || path === "/api/analysis/icp") {
      const urlStr = body?.url || "";
      const endpoint = withBase("/api/analysis/icp");
      console.log("[analysis/icp] calling backend", { url: endpoint, apiBasePresent: !!API_BASE, rawLen: RAW_BASE.length });

      // If we're on a deployed site but API_BASE is missing, don't hang. Return fallback immediately.
      const host = typeof window !== "undefined" ? window.location.hostname : "";
      const isLocal = host === "localhost" || host === "127.0.0.1";
      if (!API_BASE && !isLocal) return makeFallbackIcp(urlStr) as unknown as T;

      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 12000);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        if (!res.ok) return makeFallbackIcp(urlStr) as unknown as T;
        const data = await safeJson(res);
        return coerceToIcpSchema(data, urlStr) as unknown as T;
      } catch (e) {
        return makeFallbackIcp(urlStr) as unknown as T;
      } finally {
        clearTimeout(t);
      }
    }

    const { controller, cleanup } = withTimeout(5000);
    try {
      const res = await fetch(withBase(path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      return await res.json();
    } catch (err) {
      return {} as T;
    } finally {
      cleanup();
    }
  },

  async get<T>(path: string): Promise<T | null> {
    const { controller, cleanup } = withTimeout(2500);
    try {
      const res = await fetch(withBase(path), { method: "GET", signal: controller.signal });
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    } finally {
      cleanup();
    }
  },

  async patch<T>(path: string, body: any): Promise<T> { return {} as T; },
  async delete<T>(path: string): Promise<T> { return {} as T; },
  async upload<T>(path: string, file: File): Promise<T> { return {} as T; }
};
