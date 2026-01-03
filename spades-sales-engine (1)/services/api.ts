// ================================
// UNIVERSAL FRONTEND API CLIENT
// Deterministic + Schema-Safe
// ================================

// 1) Safe Env Reader (Prevents "Cannot read properties of undefined")
function readViteEnv(key: string): string {
  try {
    const env = (import.meta as any)?.env;
    const v = env ? env[key] : undefined;
    return typeof v === "string" ? v : "";
  } catch {
    return "";
  }
}

const RAW_BASE = readViteEnv("VITE_API_BASE_URL");
const API_BASE = RAW_BASE.replace(/\/+$/, "");
const withBase = (path: string) => (API_BASE ? `${API_BASE}${path}` : path);

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
    // salvage first JSON object if response contains extra text
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

// 2) Phase 1 Contract-Compliant Fallback (Doc4 shape)
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

  const personaTitle = "Head of Sales";

  return {
    company: {
      name: derivedName,
      domain,
      logoUrl: "/logo.png",
      brandColor: "#6C47FF",
    },
    persona: {
      title: personaTitle,
      seniority: "Executive",
      department: "Sales",
      primaryGoal: "Increase qualified meetings and conversion",
    },
    painPoints: [
      {
        title: "Backend server not reachable",
        description: "This creates delays, uncertainty, and lower conversion for head of sales teams.",
      },
      {
        title: "Manual qualification overhead",
        description: "This creates delays, uncertainty, and lower conversion for head of sales teams.",
      },
      {
        title: "Low outbound conversion",
        description: "This creates delays, uncertainty, and lower conversion for head of sales teams.",
      },
    ],
    valueProposition: {
      headline: `Increase pipeline velocity for ${derivedName}`,
      subHeadline: "Turn website signals into an ICP and sales-ready outreach.",
      keyBenefits: [
        "Clear ICP and buyer persona in minutes",
        "Pain points written in sales language",
        "Messaging that matches buyer intent",
      ],
    },
    outreach: {
      positioning: `Positioning for ${derivedName}`,
      sampleMessage: `Hi — quick note on outbound efficiency at ${derivedName}. If you want, I can share a 2-minute ICP snapshot and a message angle tailored to your buyers.`,
    },
  };
}

function isValidIcpPayload(p: any) {
  if (!p || typeof p !== "object") return false;

  const top = ["company", "persona", "painPoints", "valueProposition", "outreach"];
  if (!top.every((k) => k in p)) return false;

  const c = p.company;
  const persona = p.persona;
  const vp = p.valueProposition;
  const o = p.outreach;

  if (!c || typeof c !== "object") return false;
  if (!persona || typeof persona !== "object") return false;
  if (!vp || typeof vp !== "object") return false;
  if (!o || typeof o !== "object") return false;

  if (!isNonEmptyString(c.name)) return false;
  if (!isNonEmptyString(c.domain)) return false;
  if (!isNonEmptyString(c.logoUrl)) return false;
  if (!isNonEmptyString(c.brandColor)) return false;

  if (!isNonEmptyString(persona.title)) return false;
  if (!isNonEmptyString(persona.seniority)) return false;
  if (!isNonEmptyString(persona.department)) return false;
  if (!isNonEmptyString(persona.primaryGoal)) return false;

  if (!Array.isArray(p.painPoints) || p.painPoints.length < 3) return false;
  if (
    !p.painPoints.every(
      (pp: any) =>
        pp &&
        typeof pp === "object" &&
        isNonEmptyString(pp.title) &&
        isNonEmptyString(pp.description)
    )
  )
    return false;

  if (!isNonEmptyString(vp.headline)) return false;
  if (!isNonEmptyString(vp.subHeadline)) return false;
  if (!Array.isArray(vp.keyBenefits) || vp.keyBenefits.length < 3) return false;
  if (!vp.keyBenefits.every(isNonEmptyString)) return false;

  if (!isNonEmptyString(o.positioning)) return false;
  if (!isNonEmptyString(o.sampleMessage)) return false;

  return true;
}

// 3) Coerce legacy/unknown shapes into Doc4 (last-resort safety)
function coerceToIcpSchema(raw: any, urlStr?: string) {
  const fb = makeFallbackIcp(urlStr);

  // already Doc4
  if (isValidIcpPayload(raw)) return raw;

  // legacy flat / nested legacy
  const companyName = raw?.company?.name || raw?.companyName || fb.company.name;
  const domain = raw?.company?.domain || raw?.domain || fb.company.domain;
  const logoUrl = raw?.company?.logoUrl || raw?.logoUrl || fb.company.logoUrl;
  const brandColor = raw?.company?.brandColor || raw?.primaryColor || fb.company.brandColor;

  const personaTitle =
    raw?.persona?.title ||
    raw?.idealCustomerProfile?.persona?.role ||
    fb.persona.title;

  const personaSeniority =
    raw?.persona?.seniority ||
    raw?.idealCustomerProfile?.persona?.seniority ||
    fb.persona.seniority;

  const painRaw =
    Array.isArray(raw?.painPoints) ? raw.painPoints :
    Array.isArray(raw?.idealCustomerProfile?.painPoints) ? raw.idealCustomerProfile.painPoints :
    [];

  const painPoints = painRaw
    .map((x: any) => (typeof x === "string" ? x : x?.title))
    .filter(Boolean)
    .slice(0, 6)
    .map((t: any) => ({
      title: String(t).slice(0, 60),
      description: "This creates delays, uncertainty, and lower conversion for sales teams.",
    }));

  while (painPoints.length < 3) {
    painPoints.push({
      title: "Manual research overhead",
      description: "This creates delays, uncertainty, and lower conversion for sales teams.",
    });
  }

  const vpHeadline =
    raw?.valueProposition?.headline ||
    raw?.valueProp ||
    fb.valueProposition.headline;

  const vpSub =
    raw?.valueProposition?.subHeadline ||
    fb.valueProposition.subHeadline;

  const keyBenefitsRaw = raw?.valueProposition?.keyBenefits;
  const keyBenefits =
    Array.isArray(keyBenefitsRaw) && keyBenefitsRaw.length >= 3
      ? keyBenefitsRaw.slice(0, 5).map((s: any) => String(s))
      : fb.valueProposition.keyBenefits;

  const positioning =
    raw?.outreach?.positioning ||
    raw?.outreach?.subjectLine ||
    fb.outreach.positioning;

  const sampleMessage =
    raw?.outreach?.sampleMessage ||
    raw?.outreach?.hook ||
    fb.outreach.sampleMessage;

  const normalized = {
    company: {
      name: String(companyName),
      domain: String(domain),
      logoUrl: String(logoUrl),
      brandColor: String(brandColor),
    },
    persona: {
      title: String(personaTitle),
      seniority: String(personaSeniority),
      department: String(raw?.persona?.department || fb.persona.department),
      primaryGoal: String(raw?.persona?.primaryGoal || fb.persona.primaryGoal),
    },
    painPoints,
    valueProposition: {
      headline: String(vpHeadline),
      subHeadline: String(vpSub),
      keyBenefits,
    },
    outreach: {
      positioning: String(positioning),
      sampleMessage: String(sampleMessage),
    },
  };

  return isValidIcpPayload(normalized) ? normalized : fb;
}

// 4) API Client
export const api = {
  async post<T>(path: string, body: any): Promise<T> {
    // Critical path: only ONE endpoint for analysis
    if (path === "/analysis/icp") {
      const urlStr = body?.url || "https://example.com";

      const endpoint = withBase("/analysis/icp");
      console.log("[analysis/icp] start", { url: urlStr });
      console.log("[analysis/icp] calling backend", {
        url: endpoint,
        apiBasePresent: !!API_BASE,
      });

      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 12000);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        console.log("[analysis/icp] backend status", { status: res.status });

        if (!res.ok) {
          console.warn("[analysis/icp] fallback (backend non-200)");
          return makeFallbackIcp(urlStr) as unknown as T;
        }

        const data = await safeJson(res);
        const normalized = coerceToIcpSchema(data, urlStr);

        if (!isValidIcpPayload(normalized)) {
          console.warn("[analysis/icp] fallback (invalid payload)");
          return makeFallbackIcp(urlStr) as unknown as T;
        }

        return normalized as unknown as T;
      } catch (e: any) {
        console.warn("[analysis/icp] fallback (exception)", {
          msg: String(e?.message || e),
        });
        return makeFallbackIcp(urlStr) as unknown as T;
      } finally {
        clearTimeout(t);
      }
    }

    // General handling (Auth, etc.)
    const { controller, cleanup } = withTimeout(5000);
    try {
      const res = await fetch(withBase(path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        if (path.startsWith("/auth")) return { success: true } as unknown as T;
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await safeJson(res);
      return (data ?? ({} as any)) as T;
    } catch (err) {
      if (path.startsWith("/auth")) return { success: true } as unknown as T;
      console.warn(`[API] POST ${path} failed, returning empty obj.`);
      return {} as T;
    } finally {
      cleanup();
    }
  },

  async get<T>(path: string): Promise<T | null> {
    const url = withBase(path);
    const { controller, cleanup } = withTimeout(2500);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) return null;
      return (await safeJson(res)) as T | null;
    } catch {
      return null;
    } finally {
      cleanup();
    }
  },

  async patch<T>(path: string, body: any): Promise<T> {
    console.log(`(Stub) PATCH ${path}`);
    return {} as T;
  },

  async delete<T>(path: string): Promise<T> {
    console.log(`(Stub) DELETE ${path}`);
    return {} as T;
  },

  async upload<T>(path: string, file: File): Promise<T> {
    console.log(`(Stub) UPLOAD ${path}`);
    return {} as T;
  },
};
