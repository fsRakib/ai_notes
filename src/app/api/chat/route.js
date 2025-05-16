// app/api/gemini/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { message } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a helpful chatbot. Respond to this message: ${message}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
