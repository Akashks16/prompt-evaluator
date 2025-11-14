// api/voicebot-evaluator.js
import { Router } from "express";
import OpenAI from "openai";
import "dotenv/config";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/api/voicebot-evaluator", async (req, res) => {
  try {
    const { input_text, evaluate_target } = req.body;

    if (!input_text || typeof input_text !== "string") {
      return res.status(400).json({ error: "input_text is mandatory" });
    }

    const systemPrompt = `
You are a **Voicebot Prompt Quality Assessor**.

Evaluate the ${evaluate_target || "assistant"} based on 12 metrics...
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input_text },
      ],
      temperature: 0.3,
    });

    const outputText = completion?.choices?.[0]?.message?.content?.trim();

    return res.json({ output_text: outputText });
  } catch (err) {
    console.error("Error evaluating:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
