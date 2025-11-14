import { Router } from "express";

const router = Router();

router.post("/voicebot-evaluator", async (req, res) => {
  console.log("[ROUTE] /voicebot-evaluator hit");
  console.log("Body:", req.body);

  return res.json({
    success: true,
    message: "Working!",
    input: req.body,
  });
});

export default router;
