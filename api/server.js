import express from "express";
import serverless from "serverless-http";
import crypto from "crypto";
import voiceBotEvaluator from "./voicebot-evaluator.js";

const app = express();

if (!process.env.VERCEL) {
  console.log("Local → enabling express.json()");
  app.use(express.json());
} else {
  console.log("Vercel → using Vercel's body parser");
}

app.use((req, res, next) => {
  req._reqId = crypto.randomUUID();
  console.log(`\n-------- REQUEST ${req._reqId} --------`);
  console.log(`${req.method} ${req.originalUrl}`);
  console.log("Body:", req.body);
  next();
});

// IMPORTANT: Mount at root
app.use("/", voiceBotEvaluator);

app.use((err, req, res, next) => {
  console.error(`❌ Error in req ${req._reqId}:`, err);
  res.status(500).json({
    request_id: req._reqId,
    error: err?.message || "Internal error",
  });
});

export default serverless(app);
