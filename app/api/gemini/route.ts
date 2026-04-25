import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { stats } = body;

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing server-side API key for Gemini' },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a financial property advisor, analyze these stats and give 3 bullet points of advice: ${JSON.stringify(stats)}`,
      config: {
        temperature: 0.6,
      },
    });

    return NextResponse.json({ advice: response.text });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      {
        advice:
          'Keep monitoring your collection rates and maintain a reserve fund.',
      },
      { status: 200 }
    );
  }
}
