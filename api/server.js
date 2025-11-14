// api/server.js
import express from "express";
import serverless from "serverless-http";
import voiceBotEvaluator from "./voicebot-evaluator.js";

const app = express();

// Vercel already parses the request body
if (!process.env.VERCEL) {
  app.use(express.json());
}

// Mount router
app.use(voiceBotEvaluator);

// Default export required by Vercel
export default serverless(app);
