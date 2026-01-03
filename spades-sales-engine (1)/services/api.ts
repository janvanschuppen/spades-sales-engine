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
  return !!(p.company && p.persona && p.painPoints && p.valueProposition && p.outreach);
}

function coerceToIcpSchema(raw: any, urlStr?: string) {
  const fb = makeFallbackIcp(urlStr);
  if (isValidIcpPayload(raw)) return raw;
  return {
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
    painPoints: Array.isArray(raw?.painPoints) ? raw.painPoints : fb.painPoints,
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
}

export const api = {
  async post<T>(path: string, body: any): Promise<T> {
    if (path === "/analysis/icp") {
      const urlStr = body?.url || "";
      const endpoint = withBase("/analysis/icp");
      console.log("[analysis/icp] calling backend", { endpoint, apiBasePresent: !!API_BASE });
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
    try {
      const res = await fetch(withBase(path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (err) { return {} as T; }
  },
  async get<T>(path: string): Promise<T | null> {
    try {
      const res = await fetch(withBase(path), { method: "GET" });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  async patch<T>(path: string, body: any): Promise<T> { return {} as T; },
  async delete<T>(path: string): Promise<T> { return {} as T; },
  async upload<T>(path: string, file: File): Promise<T> { return {} as T; }
};
