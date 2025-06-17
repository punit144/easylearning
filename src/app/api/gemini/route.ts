import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  console.log("API request received");

  try {
    const { skill, level, depth } = await req.json();
    console.log(`Parsed request: Skill=${skill}, Level=${level}, Depth=${depth}`);

    const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Generate a clean and structured table of contents for someone with ${level} knowledge in ${skill} preparing for ${depth} learning. 
Return only the numbered sections, chapters, and bullet points with no introduction or summary. 
Do not include lines like 'Table of Contents:', motivational messages, or closing advice. 
Format it clearly with section titles and subtopics using Markdown-style hierarchy (e.g., I., 1.1, *, etc.).`,

            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.5,
        // maxOutputTokens: 3000,
        topP: 0.9,
        topK: 40
      },
    }),
  }
);


    const data = await response.json();
    console.log("Gemini API response:", data);

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No valid response from Gemini");
    }

    return NextResponse.json({
      result: data.candidates[0].content.parts[0].text,
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
