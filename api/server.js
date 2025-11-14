// api/server.js
import express from "express";
import serverless from "serverless-http";
import voiceBotEvaluator from "./voicebot-evaluator.js";

const app = express();
app.use(express.json());

// Mount router
app.use(voiceBotEvaluator);

// Export DEFAULT handler — REQUIRED by Vercel
export default serverless(app);
