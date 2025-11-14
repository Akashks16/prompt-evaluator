// api/index.js
import express from "express";
import serverless from "serverless-http";
import voiceBotEvaluator from "./voicebot-evaluator.js";

const app = express();
app.use(express.json());
app.use("/api/voicebot-evaluator", voiceBotEvaluator);

// ✅ Export only the handler for Vercel
export default serverless(app);
