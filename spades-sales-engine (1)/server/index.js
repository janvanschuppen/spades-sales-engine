const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

/* -------------------- */
/* BASIC SETUP */
/* -------------------- */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

/* -------------------- */
/* SERVE logo.png (NO public folder needed) */
/* -------------------- */
app.get("/logo.png", (req, res) => {
  const logoPath = path.join(__dirname, "logo.png");
  if (fs.existsSync(logoPath)) {
    res.sendFile(logoPath);
  } else {
    res.status(404).send("logo.png missing");
  }
});

/* -------------------- */
/* HEALTH */
/* -------------------- */
app.get("/health", (_, res) => res.status(200).send("ok"));
app.get("/auth/me", (_, res) => res.json({ success: false, user: null }));

/* -------------------- */
/* ICP BUILDER — LOCKED + SAFE */
/* -------------------- */
async function buildIcpResponse(url) {
  let domain = "company.com";
  let name = "COMPANY";

  try {
    domain = String(url || "")
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
    name = domain.split(".")[0].toUpperCase();
  } catch {}

  return {
    /* ✅ FRONTEND EXPECTED SHAPE */

    company: {
      name,
      domain,
      logoUrl: "/logo.png", // 🔒 HARD LOCK — NO FACEBOOK, NO CLEARBIT
      brandColor: "#6C47FF"
    },

    primaryColor: "#6C47FF",

    valueProp:
      "Automate your entire sales pipeline without manual work.",

    icp: {
      persona: {
        name: "Alex Morgan",
        age: 42,
        title: "VP of Sales",
        mindset: "Growth-focused, efficiency obsessed",
        motivation: "Hit aggressive revenue targets with fewer people"
      },

      painPoints: [
        {
          title: "Inconsistent messaging",
          description: "Every rep sells differently"
        },
        {
          title: "Manual CRM work",
          description: "Sales time wasted on admin"
        },
        {
          title: "Pipeline unpredictability",
          description: "Forecasts are unreliable"
        }
      ]
    },

    outreach: {
      hook: `Most ${name} leaders lose deals due to broken outbound systems.`,
      positioning: "Strategic Revenue Infrastructure"
    }
  };
}

/* -------------------- */
/* ROUTES */
/* -------------------- */
app.post("/analysis/icp", async (req, res) => {
  const data = await buildIcpResponse(req.body?.url);
  res.json(data);
});

app.post("/api/analysis/icp", async (req, res) => {
  const data = await buildIcpResponse(req.body?.url);
  res.json(data);
});

/* -------------------- */
/* START SERVER */
/* -------------------- */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
