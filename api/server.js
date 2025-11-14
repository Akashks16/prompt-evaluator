// api/server.js
import express from "express";
import voiceBotEvaluator from "./voicebot-evaluator.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api", voiceBotEvaluator);

app.listen(PORT, () => {
  console.log(`🚀 Local server running → http://localhost:${PORT}`);
});
