const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.post("/analysis/icp", (req, res) => res.json({ ok: true, source: "Live Backend" }));

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log("Server Live"));
