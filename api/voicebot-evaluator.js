import express from "express";
import serverless from "serverless-http";
import voiceBotEvaluator from "./voicebot-evaluator.js";

const app = express();
app.use(express.json());

// Force GET → POST (optional)
app.use((req, res, next) => {
  if (req.method === "GET" && req.body && Object.keys(req.body).length > 0) {
    req.method = "POST";
  }
  next();
});

// Mount router at root (Vercel already uses /api)
app.use("/", voiceBotEvaluator);

// Root route
app.all("/", (req, res) => {
  res.json({ message: "Voicebot API ready" });
});

export default serverless(app);
