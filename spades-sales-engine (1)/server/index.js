const express = require("express");
const cors = require("cors");

const app = express();

// Enable CORS for frontend requests
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// --- ROUTES ---

// 1. Main Analysis Endpoint (used by LandingPage)
// UPDATED: Now returns Document 4 compliant nested structure
app.post("/api/analysis/icp", (req, res) => {
  console.log("🟪 BACKEND: Processing /api/analysis/icp for", req.body.url);

  // Parse company name from URL for better realism
  let companyName = "COMPANY";
  let domain = "company.com";
  try {
     const hostname = (req.body.url || "").replace(/^https?:\/\//, "").split("/")[0];
     domain = hostname;
     companyName = hostname.split('.')[0].toUpperCase();
  } catch (e) {}

  // Return Document 4 Compliant Schema (Nested)
  res.json({
    company: {
      name: companyName,
      domain: domain,
      logoUrl: "/static/branding/logo.png",
      brandColor: "#6C47FF"
    },
    persona: {
      title: "VP of Sales",
      seniority: "Executive",
      department: "Sales",
      primaryGoal: "Increase Revenue Efficiency"
    },
    painPoints: [
      { title: "Inconsistent messaging across team", description: "Reps saying different things." },
      { title: "Manual data entry overhead", description: "Wasting time in CRM." },
      { title: "Low outbound conversion rates", description: "Hard to break through noise." },
      { title: "Long sales cycles", description: "Deals stalling in pipeline." }
    ],
    valueProposition: {
      headline: "Automate your entire sales pipeline.",
      subHeadline: "From lead gen to closed-won, without the manual grunt work.",
      keyBenefits: ["Higher Conversion", "Lower CAC", "Faster Velocity"]
    },
    outreach: {
      positioning: "Strategic Growth Partner",
      sampleMessage: `I noticed ${companyName} is scaling rapidly. Most leaders I speak with struggle to maintain outbound consistency during growth phases. This engine solves that.`
    }
  });
});

// 2. Gemini Service Endpoints (used by OnboardingWizard)
app.post("/api/gemini/analyze", (req, res) => {
    res.json({
        positioning: "Automated Sales Infrastructure",
        offer: "End-to-end outbound automation",
        icp_hint: "B2B SaaS Companies",
        trust: ["SOC2 Compliant", "Enterprise Ready"]
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
        painPoints: ["High CAC", "SDR turnover", "Pipeline unpredictability"]
    });
});

// 3. Auth Endpoints
app.get("/api/auth/me", (req, res) => {
    res.json({ success: false, user: null });
});

app.post("/api/auth/login", (req, res) => {
    const { email } = req.body;
    res.json({ 
        success: true, 
        user: { 
            id: '123', 
            email, 
            firstName: 'Demo', 
            lastName: 'User', 
            role: 'admin',
            tier: 'full' 
        } 
    });
});

app.post("/api/auth/register", (req, res) => {
    res.json({ success: true });
});

// Start Server
const PORT = 3001;
app.listen(PORT, () =>
  console.log(`🚀 Backend running at http://localhost:${PORT}`)
);