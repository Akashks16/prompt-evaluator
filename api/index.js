// api/server.js
import express from "express";
import serverless from "serverless-http";
import voicebotEvaluator from "./voicebot-evaluator.js";

const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  return res?.json({
    name: "working",
  });
});
app.use("/api/voicebot-evaluator", voicebotEvaluator);

// export const handler = serverless(app);
app.listen(3000, () => {
  console.log("listenting");
});

export default app;
