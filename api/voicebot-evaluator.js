import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

// Initialize OpenAI with your API key (Vercel env var recommended)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/voicebot-evaluator", async (req, res) => {
  try {
    const { input_text, evaluate_target } = req.body;

    if (!input_text || typeof input_text !== "string") {
      return res.status(400).json({ error: "input_text is mandatory" });
    }

    const systemPrompt = `
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
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input_text },
      ],
      temperature: 0.3,
    });

    const outputText = completion.choices?.[0]?.message?.content?.trim();

    return res.json({ output_text: outputText });
  } catch (err) {
    console.error("Error evaluating prompt:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default app;
