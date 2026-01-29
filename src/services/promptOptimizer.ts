import optimizePrompts from "../config/optimize_prompts.json";

const OPTIMIZE_ENDPOINT = "https://llm.chutes.ai/v1/chat/completions";
const OPTIMIZE_MODEL = "chutesai/Mistral-Small-3.2-24B-Instruct-2506";

export async function optimizePrompt(
  apiKey: string,
  modelId: string,
  originalPrompt: string,
): Promise<string> {
  const systemPrompt = optimizePrompts[modelId as keyof typeof optimizePrompts];

  if (!systemPrompt) {
    throw new Error(`No optimization prompt found for model: ${modelId}`);
  }

  const response = await fetch(OPTIMIZE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPTIMIZE_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: originalPrompt,
        },
      ],
      stream: false,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Optimization failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || originalPrompt;
}
