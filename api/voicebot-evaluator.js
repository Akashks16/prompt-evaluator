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

  console.log(`🟦 [${id}] ========== REQUEST START ==========`);
  console.log(`🟦 [${id}] Timestamp: ${new Date().toISOString()}`);
  console.log(
    `🟦 [${id}] Request body:`,
    JSON.stringify(req.body).substring(0, 200)
  );
  console.log(
    `🟦 [${id}] Environment: ${process.env.VERCEL ? "VERCEL" : "LOCAL"}`
  );
  console.log(
    `🟦 [${id}] OpenAI API Key exists: ${!!process.env.OPENAI_API_KEY}`
  );

  try {
    const { input_text, evaluate_target } = req.body || {};

    console.log(
      `🟦 [${id}] Input text length: ${input_text?.length || 0} chars`
    );
    console.log(
      `🟦 [${id}] Evaluate target: ${evaluate_target || "assistant"}`
    );

    if (!input_text) {
      console.log(`❌ [${id}] Missing input_text`);
      return res.status(400).json({
        success: false,
        error: "input_text is required",
        request_id: id,
      });
    }

    console.log(`🟦 [${id}] Calling OpenAI API...`);
    const apiCallStart = Date.now();

    const timeoutMs = 8000; // 8 seconds timeout

    const completionPromise = openai.chat.completions.create({
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
      timeout: timeoutMs,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    );

    console.log(
      `🟦 [${id}] Waiting for OpenAI response (max ${timeoutMs}ms)...`
    );
    const completion = await Promise.race([completionPromise, timeoutPromise]);

    const apiCallDuration = Date.now() - apiCallStart;
    console.log(`✅ [${id}] OpenAI API call completed in ${apiCallDuration}ms`);
    console.log(
      `✅ [${id}] Response length: ${
        completion.choices[0].message.content?.length || 0
      } chars`
    );

    const totalDuration = Date.now() - start;
    console.log(`✅ [${id}] Total request duration: ${totalDuration}ms`);
    console.log(`✅ [${id}] ========== REQUEST SUCCESS ==========`);

    return res.json({
      success: true,
      output_text: completion.choices[0].message.content,
      request_id: id,
      duration_ms: totalDuration,
      api_call_duration_ms: apiCallDuration,
    });
  } catch (err) {
    const errorDuration = Date.now() - start;
    console.error(`❌ [${id}] ========== REQUEST FAILED ==========`);
    console.error(`❌ [${id}] Error type: ${err.constructor.name}`);
    console.error(`❌ [${id}] Error message: ${err.message}`);
    console.error(`❌ [${id}] Error stack:`, err.stack);
    console.error(`❌ [${id}] Duration before error: ${errorDuration}ms`);
    console.error(`❌ [${id}] ========================================`);

    if (err.message === "Request timeout") {
      return res.status(504).json({
        success: false,
        error:
          "Request timed out. Try with shorter input or upgrade to Vercel Pro.",
        request_id: id,
        duration_ms: errorDuration,
      });
    }

    return res.status(500).json({
      success: false,
      error: err.message,
      request_id: id,
      duration_ms: errorDuration,
    });
  }
});

// Add a health check endpoint
router.get("/health", (req, res) => {
  console.log(`💚 Health check called`);
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? "VERCEL" : "LOCAL",
    openai_key_present: !!process.env.OPENAI_API_KEY,
  });
});

export default router;
