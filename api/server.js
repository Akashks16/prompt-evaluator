// api/server.js
import express from "express";
import serverless from "serverless-http";
import voiceBotEvaluator from "./voicebot-evaluator.js";

const app = express();
app.use(express.json());

// mount router correctly
app.use(voiceBotEvaluator);

// export handler for Vercel
export const handler = serverless(app);
