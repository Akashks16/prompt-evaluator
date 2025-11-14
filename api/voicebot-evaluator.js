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

router.post("/", async (req, res) => {
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

    if (!input_text) {
      return res.status(400).json({
        success: false,
        error: "input_text is required",
        request_id: id,
      });
    }

    console.log(`🟦 [${id}] Calling OpenAI API...`);
    const apiCallStart = Date.now();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Evaluate the given voicebot prompt for production readiness by assessing it against the 12 specific metrics listed below. For each metric, follow these steps:
Assign a numeric score (1–5, where 1 = poor, 5 = excellent) or Yes/No as indicated.
Provide a concise justification for the score/assessment.
After scoring all metrics, calculate the total PASS score as a percentage of the maximum possible (total actual points ÷ total possible points × 100).
Indicate overall status: PASS if ≥80%, otherwise FAIL.
Highlight any critical problems that would block production readiness.
Where applicable, suggest actionable improvements.
Persist through all 12 metrics before providing the overall result. Use step-by-step reasoning for each metric before moving to the next. Only present your final score, summary, and PASS/FAIL status after reviewing all criteria and providing individual reasoning.  
**The 12 Evaluation Metrics:**  
1. Prompt Length: Meets optimal token/word count (≤1200 tokens for full persona+SOP or ≤600 tokens for modular flows).  
2. Hallucination Prevention: Bot is instructed to avoid speculation, never provide unverifiable info, fallback phrases like "I don’t know."  
3. Clarity and Specificity: Unambiguous instructions, logical breakdown of steps.  
4. Prompt Modularity: Modular chunks (greetings, confirmations, escalation, feedback), not monolithic.  
5. Relevance and Redundancy Control: All content relevant; no unnecessary or redundant info.  
6. Test Coverage: Handles all types of customer requests, edge cases, and escalation flows.  
7. SOP Compliance: Explicit guidance through all standard SOP steps (greeting, clarification, order ID w/retries, confirmation, escalation, closure).  
8. Ambiguity Handling & Confirmation: Ambiguity triggers paraphrase & confirmation; no assumptions; explicit checks/summaries in multi-step flows.  
9. Numerical & Sensitive Data Handling: All numbers, dates, caps, and sensitive info have pronunciation, spelling, and digit-instruction clarity.
10. Tone & Human-Like Naturalness: Mandate empathy, friendliness, conversational and dynamic tone adaptation.  
11. No Redundancy: No repeated requests or unnecessary clarification after info provided; maintains context.  
12. Escalation/Error Handling: Specifies escalation, polite error/failure messages, retries, no endless loops.
---
### Output Format
Respond with the following structure:
#### Evaluation Table
| # | Metric | Score (1-5 or Yes/No) | Justification |
|---|--------|-----------------------|--------------|
| 1 | Prompt Length | [Score] | [Reason] |
| 2 | Hallucination Prevention | [Score/Yes/No] | [Reason] |
| … | … | … | … |
| 12 | Escalation/Error Handling | [Score] | [Reason] |
#### Calculation
**Total Points Scored:** X
**Maximum Possible Points:** Y
**PASS Score:** X / Y x 100 = Z%
**Status:** PASS or FAIL
#### Critical Blocking Issues
[List any critical failures or missing requirements that prevent production readiness]
#### Suggested Improvements
[Enumerated actionable recommendations for areas scoring less than 5 or marked as "No"]
---
**Example (shortened for illustration):**
| # | Metric | Score | Justification |
|---|--------|-------|--------------|
| 1 | Prompt Length | 5 | Prompt is 530 tokens, within modular flow target |
| 2 | Hallucination Prevention | 3 | States "avoid speculation," but lacks fallback phrase |
| … | … | … | … |
| 12 | Escalation/Error Handling | 4 | Handles transfer, but missing polite failure message |
**Total Points Scored:** 42  
**Maximum Possible Points:** 48  
**PASS Score:** 42/48 x 100 = 87.5%  
**Status:** PASS
**Critical Blocking Issues:**  
No fallback phrase for unverifiable info—risk of hallucination under uncertainty.
**Suggested Improvements:**  
Add explicit fallback language for unknowns, e.g., "I don’t know."
Insert polite closure in error flows.
(Realistic evaluations should be more detailed, with justifications and suggestions expanded for production-level feedback.)
---
**Reminder:**  
Score each metric with supporting reasoning before calculating the overall result.  
Present PASS/FAIL and any critical issues last.  
Use table format for clarity and consistency.
**Key instructions:**  
Evaluate the supplied prompt against all 12 metrics step by step, reasoning before conclusions, scoring each, then giving your summary and PASS/FAIL at the end. Include concise but precise justifications and improvement suggestions for problem areas.`,
        },
        { role: "user", content: input_text },
      ],
    });

    const apiCallDuration = Date.now() - apiCallStart;
    const totalDuration = Date.now() - start;

    console.log(`✅ [${id}] OpenAI API call completed in ${apiCallDuration}ms`);
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
    console.error(`❌ [${id}] REQUEST FAILED:`, err);

    return res.status(500).json({
      success: false,
      error: err.message,
      request_id: id,
      duration_ms: errorDuration,
    });
  }
});

// Health check
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
