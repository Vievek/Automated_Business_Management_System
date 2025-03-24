// app/api/gemini/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { prompt } = await request.json();
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // Ensure this is set in your .env.local

  if (!apiKey) {
    return NextResponse.json({ error: "API key not set" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const chat = model.startChat({
    generationConfig: {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });

  try {
    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();
    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ error: "Gemini API error" }, { status: 500 });
  }
}
