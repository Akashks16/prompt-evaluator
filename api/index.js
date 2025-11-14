import express from "express";
import serverless from "serverless-http";
import voiceBotEvaluator from "./voicebot-evaluator.js";

console.log("🚀 [INIT] Starting universal router serverless function");

const app = express();
app.use(express.json());

// Middleware to log incoming requests
app.use((req, res, next) => {
  const reqId = Math.random().toString(36).substring(7);
  req.reqId = reqId;
  req.startTime = Date.now();

  console.log(`📥 [${reqId}] ${req.method} ${req.url}`);
  console.log(`📥 [${reqId}] Headers:`, req.headers);
  console.log(
    `📥 [${reqId}] Body preview:`,
    JSON.stringify(req.body).substring(0, 150)
  );
  next();
});

// Force all requests to POST method if they have a body
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0 && req.method !== "POST") {
    console.log(
      `⚡ [${req.reqId}] Converting ${req.method} to POST internally`
    );
    req.method = "POST";
  }
  next();
});

// Mount the voiceBotEvaluator router at root
app.use("/", voiceBotEvaluator);

// Log all responses
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - req.startTime;
    console.log(
      `📤 [${req.reqId}] Response in ${duration}ms, status ${res.statusCode}`
    );
    return originalJson.call(this, data);
  };
  next();
});

// Catch-all 404 (should rarely hit now)
app.use((req, res) => {
  res
    .status(404)
    .json({ error: "Route not found", path: req.url, method: req.method });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[${req.reqId}] Error:`, err);
  res.status(500).json({ error: err.message });
});

// Export for Vercel
export default serverless(app);
