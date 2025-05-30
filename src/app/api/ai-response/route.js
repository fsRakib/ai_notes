import { NextResponse } from "next/server";
import OpenAI from "openai";

const token = "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";
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const client = new OpenAI({ baseURL: endpoint, apiKey: token });

    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "" },
        { role: "user", content: prompt },
      ],
      temperature: 1,
      top_p: 1,
      model,
    });

    return NextResponse.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
