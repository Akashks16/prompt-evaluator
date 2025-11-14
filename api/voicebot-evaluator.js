// api/voicebot-evaluator.js
import { Router } from "express";
import OpenAI from "openai";
import crypto from "crypto";
import "dotenv/config";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function reqId() {
  return crypto.randomUUID();
}

router.post("/voicebot-evaluator", async (req, res) => {
  const id = reqId();
  const start = Date.now();
  console.log(`🟦 [${id}] Incoming request`, req.body);

  try {
    const { input_text, evaluate_target } = req.body || {};

    if (!input_text) {
      return res.status(400).json({
        success: false,
        error: "input_text is required",
        request_id: id,
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a **Voicebot Prompt Quality Assessor**.

You will be given the full conversation between a user and an assistant.

Evaluate the ${
            evaluate_target || "assistant"
          }'s responses based on the following 12 production-readiness metrics:
1. Context Understanding  
2. Hallucination Prevention  
3. Prompt Length  
4. Clarity  
5. Relevance  
6. Tone & Empathy  
7. Compliance with SOP/Policies  
8. Fallback Behavior  
9. Redundancy  
10. Grammar & Structure  
11. User Intent Understanding  
12. Output Format Consistency  

Return the result as a markdown table:

| # | Metric | Score (1-5) | Justification |
|---|---------|-------------|----------------|
| 1 | ... | ... | ... |

At the end, include:
**Total Points Scored**, **PASS %**, and **Status: PASS ✅ or FAIL ❌**
    `,
        },
        { role: "user", content: input_text },
      ],
    });

    return res.json({
      success: true,
      output_text: completion.choices[0].message.content,
      request_id: id,
      duration_ms: Date.now() - start,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;
