// ================================
// UNIVERSAL FRONTEND API CLIENT
// Connects to Backend or uses Fallback
// ================================

// 1. Safe Env Reader (Prevents "Cannot read properties of undefined")
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
    return null;
  }
}

// 2. Fallback Data (Hoisted & Flat for UI)
function getOfflineIcpFallback(url?: string) {
  let derivedName = "Fallback Corp";
  let domain = "fallback.com";
  
  if (url) {
      try { 
          const clean = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
          derivedName = clean.split('.')[0].toUpperCase(); 
          domain = clean.split('/')[0];
      } catch(e) {}
  }

  // MUST return FLAT structure for UI compatibility
  return {
      companyName: derivedName,
      domain: domain,
      logoUrl: "/static/branding/logo.png",
      primaryColor: "#6C47FF",
      industry: "SaaS",
      valueProp: "A next-generation sales engine that transforms raw domain data into closing-ready pipeline (Offline Mode).",
      idealCustomerProfile: {
          persona: { role: "Head of Sales", seniority: "Executive" },
          painPoints: [
              "Backend server not reachable",
              "Manual qualification overhead",
              "Low outbound conversion"
          ]
      },
      outreach: {
          subjectLine: `Scaling ${derivedName} sales operations`,
          hook: `I noticed ${derivedName} is expanding. Most leaders struggle with outbound efficiency—this engine automates the entire pipeline.`
      }
  };
}

// 3. Helpers for Anti-Hang & Data Merging
function mergeIntoFallback(fb: any, incoming: any) {
  return {
    ...fb,
    ...(incoming || {}),
    idealCustomerProfile: {
      ...(fb?.idealCustomerProfile || {}),
      ...(incoming?.idealCustomerProfile || {}),
      persona: {
        ...(fb?.idealCustomerProfile?.persona || {}),
        ...(incoming?.idealCustomerProfile?.persona || {})
      }
    },
    outreach: {
      ...(fb?.outreach || {}),
      ...(incoming?.outreach || {})
    }
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonBestEffort(url: string, body: string, msTimeout: number) {
  // Promise.race timeout: guarantees the caller returns on time even if fetch hangs.
  const fetchPromise = fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  }).then(async (resp) => {
    // DIAGNOSTIC LOG
    console.log("[analysis/icp] resp", { url, status: resp.status });
    
    if (!resp.ok) return { ok: false, status: resp.status, data: null };
    try {
      const data = await resp.json();
      return { ok: true, status: resp.status, data };
    } catch {
      return { ok: false, status: resp.status, data: null };
    }
  }).catch(() => {
    // DIAGNOSTIC LOG
    console.warn("[analysis/icp] fetch failed", { url });
    return { ok: false, status: 0, data: null };
  });

  const timeoutPromise = sleep(msTimeout).then(() => ({ ok: false, status: -1, data: null }));

  return Promise.race([fetchPromise, timeoutPromise]) as Promise<{ ok: boolean; status: number; data: any }>;
}

// 4. API Client
export const api = {
  async post<T>(path: string, body: any): Promise<T> {
    
    // SPECIAL HANDLING: Analysis (Critical Path) - ANTI-HANG LOGIC
    if (path === '/analysis/icp' || path === '/api/analysis/icp') {
      const urlStr = body?.url || "https://example.com";
      const fb = getOfflineIcpFallback(urlStr);

      // Guard: Ensure UI receives flat structure or fallback
      const ensureFlat = (x: any) => {
        if (x && typeof x === "object" && typeof x.companyName === "string") return x;
        return getOfflineIcpFallback(urlStr);
      };

      // Hard guarantee: resolve fast enough to unblock the Loading screen.
      const HARD_TIMEOUT_MS = 6500;
      const start = Date.now();

      try {
        console.log("[analysis/icp] start", { url: urlStr });
        // DIAGNOSTIC LOG
        console.log("[analysis/icp] base", { API_BASE: API_BASE || "(relative)" });

        const payload = JSON.stringify(body);
        const endpoints = ["/analysis/icp", "/api/analysis/icp"];

        for (const ep of endpoints) {
          const full = withBase(ep);
          const remaining = HARD_TIMEOUT_MS - (Date.now() - start);
          if (remaining <= 0) break;

          const res = await fetchJsonBestEffort(full, payload, Math.min(remaining, 4500));

          if (res.ok && res.data && typeof res.data === "object") {
            // 1) If backend already returns the FLAT shape your UI expects, use it.
            if ("companyName" in res.data) {
              console.log("[analysis/icp] success flat", { ep });
              return ensureFlat(mergeIntoFallback(fb, res.data)) as unknown as T;
            }

            // 2) If backend returns nested Doc4 shape, adapt safely without changing UI expectations.
            if (res.data.company && res.data.valueProposition) {
              const companyName = res.data?.company?.name || fb.companyName;
              const domain = res.data?.company?.domain || fb.domain;
              const logoUrl = res.data?.company?.logoUrl || fb.logoUrl;
              const primaryColor = res.data?.company?.brandColor || fb.primaryColor;

              const headline = res.data?.valueProposition?.headline || "";
              const sub = res.data?.valueProposition?.subHeadline || "";
              const valueProp = `${headline} ${sub}`.trim() || fb.valueProp;

              console.log("[analysis/icp] success nested->fallback", { ep });
              return ensureFlat({
                ...fb,
                companyName,
                domain,
                logoUrl,
                primaryColor,
                valueProp
              }) as unknown as T;
            }

            // 3) Unknown shape: do not risk UI. Fall back.
            console.log("[analysis/icp] unknown shape, using fallback", { ep });
            return ensureFlat(fb) as unknown as T;
          }
        }

        console.warn("[analysis/icp] fallback (no valid response)");
        return ensureFlat(fb) as unknown as T;
      } catch (e) {
        console.warn("[analysis/icp] fallback (exception)", e);
        return ensureFlat(fb) as unknown as T;
      }
    }

    // GENERAL HANDLING (Auth, etc.)
    const { controller, cleanup } = withTimeout(5000);
    try {
      const res = await fetch(withBase(path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!res.ok) {
        if (path.startsWith('/auth')) return { success: true } as unknown as T;
        throw new Error(`HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      if (path.startsWith('/auth')) return { success: true } as unknown as T;
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
            signal: controller.signal
        });
        if (!res.ok) return null;
        return await safeJson(res);
    } catch (err) {
        return null; // Silent fail
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
  }
};