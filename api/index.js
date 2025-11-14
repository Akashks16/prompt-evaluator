// api/index.js
import express from "express";
import serverless from "serverless-http";
import voiceBotEvaluator from "./voicebot-evaluator.js";

const app = express();

app.use(express.json());

// Mount the router WITHOUT /api (Vercel already includes /api)
app.use(voiceBotEvaluator);

// Required default export for Vercel
export default serverless(app);
