// api/server.js
import express from "express";
import voiceBotEvaluator from "./voicebot-evaluator.js";

const app = express();
app.use(express.json());

app.use(voiceBotEvaluator); // Mount your evaluator route

app.listen(3000, () => console.log("Server running on port 3000"));
