import { Router, type IRouter } from "express";
import { GenerateProductContentBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/product/generate", async (req, res) => {
  const parseResult = GenerateProductContentBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.message });
    return;
  }

  const { imageUrl, productCategory, additionalInfo } = parseResult.data;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const systemPrompt = `You are a high-performance ecommerce conversion expert specializing in Indian dropshipping products.

Analyze the product image and generate a complete high-converting product content package.

RULES:
- Do NOT sound like AI
- Do NOT use generic phrases like "high quality product"
- Focus on Indian buying psychology (price sensitive, trust issues, COD preference)
- Make it feel like a winning product ad
- Use Indian context: rupee symbol ₹, reference Indian shopping habits
- Be specific and direct, not vague

Generate the content in exactly this JSON format with these exact section keys:

{
  "names": "Option 1: [name]\\nOption 2: [name]\\nOption 3: [name]",
  "hooks": "Hook 1: [scroll-stopping first line]\\nHook 2: [scroll-stopping first line]\\nHook 3: [scroll-stopping first line]",
  "description": "PROBLEM:\\n[what pain it solves - be specific]\\n\\nSOLUTION:\\n[how the product helps]\\n\\nKEY BENEFITS:\\n• [benefit 1 - outcome focused]\\n• [benefit 2]\\n• [benefit 3]\\n• [benefit 4]\\n• [benefit 5]\\n\\nSOCIAL PROOF:\\n[social proof style line - e.g. '10,000+ orders shipped across India']\\n\\nCTA:\\n[strong call to action]",
  "benefits": "• [Benefit 1 - specific outcome]\\n• [Benefit 2 - specific outcome]\\n• [Benefit 3 - specific outcome]\\n• [Benefit 4 - specific outcome]\\n• [Benefit 5 - specific outcome]",
  "adCopy": "AD 1:\\n[Hook line]\\n[Problem]\\n[Solution]\\n[CTA]\\n\\nAD 2:\\n[Hook line]\\n[Problem]\\n[Solution]\\n[CTA]\\n\\nAD 3:\\n[Hook line]\\n[Problem]\\n[Solution]\\n[CTA]",
  "videoScript": "HOOK (0-3 sec):\\n[Attention grabbing opener]\\n\\nPROBLEM (3-8 sec):\\n[Show the pain point]\\n\\nDEMO (8-14 sec):\\n[Show product in use]\\n\\nRESULT (14-18 sec):\\n[Show the transformation/result]\\n\\nCTA (18-20 sec):\\n[Action line with link/offer]",
  "pricing": "SUGGESTED MRP: ₹[amount]\\nDISCOUNT PRICE: ₹[amount] ([X]% off)\\nPSYCHOLOGICAL PRICE: ₹[999/499/etc]\\n\\nREASONING:\\n[Why this pricing works - mention COD, first order trust, etc.]",
  "tags": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10",
  "imageIdeas": "CONCEPT 1 - Before/After:\\n[Detailed description of before/after split shot]\\n\\nCONCEPT 2 - Lifestyle:\\n[Detailed description of lifestyle usage shot]\\n\\nCONCEPT 3 - Close-up/Detail:\\n[Detailed description of close-up product shot]"
}

Output ONLY valid JSON, no markdown, no extra text.`;

  const userMessage = `Product Image URL: ${imageUrl}
${productCategory ? `Product Category: ${productCategory}` : ""}
${additionalInfo ? `Additional Info: ${additionalInfo}` : ""}

Analyze this product image and generate the complete Indian dropshipping product content package. Be specific, direct, and sales-focused.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userMessage },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";

    let parsed: Record<string, string> = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { error: "Failed to parse AI response", raw: content };
    }

    const sections = ["names", "hooks", "description", "benefits", "adCopy", "videoScript", "pricing", "tags", "imageIdeas"];

    for (const section of sections) {
      if (parsed[section]) {
        res.write(`data: ${JSON.stringify({ section, content: parsed[section] })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Error generating product content");
    res.write(`data: ${JSON.stringify({ error: "Failed to generate content. Please try again." })}\n\n`);
    res.end();
  }
});

export default router;
