// api/index.js
import express from "express";
import serverless from "serverless-http";
import voiceBotEvaluator from "./voicebot-evaluator.js";

const app = express();

app.use(express.json()); // Vercel supports this
app.use("/api", voiceBotEvaluator);

export const handler = serverless(app);
