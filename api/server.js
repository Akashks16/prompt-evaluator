// api/server.js
import express from "express";
import serverless from "serverless-http";
import voiceBotEvaluator from "./voicebot-evaluator.js";
import crypto from "crypto";

const app = express();

/**
 * 🟦 Body parser rule
 * Vercel already parses the body, so only enable express.json() when NOT on Vercel.
 */
if (!process.env.VERCEL) {
  console.log("[server] Running locally → enabling express.json()");
  app.use(express.json());
} else {
  console.log(
    "[server] Running on Vercel → using Vercel’s request body parser"
  );
}

/**
 * 🟩 Debug middleware → logs every request with a unique request ID
 */
app.use((req, res, next) => {
  req._reqId = crypto.randomUUID();
  console.log(`\n----------- REQUEST ${req._reqId} -----------`);
  console.log(`[${req.method}] ${req.originalUrl}`);

  // Log Body (safe stringify)
  try {
    console.log("Body:", JSON.stringify(req.body, null, 2));
  } catch (e) {
    console.log("Body: <unparseable>");
  }

  next();
});

/**
 * 🟨 Attach routes
 */
app.use(voiceBotEvaluator);

/**
 * 🟥 Error handler (catches thrown errors inside async routes)
 */
app.use((err, req, res, next) => {
  console.error(`\n❌ ERROR in request ${req._reqId}:`, err);

  return res.status(500).json({
    request_id: req._reqId,
    error: "Internal Server Error",
    details: err?.message ?? "Unknown error",
  });
});

/**
 * Default export — required by Vercel
 */
export default serverless(app);
