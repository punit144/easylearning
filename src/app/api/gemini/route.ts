import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { skill, level, topic, type } = body;

  const getPrompt = () => {
    if (type === "toc") {
      return `Generate a clean and structured table of contents for someone with ${level} knowledge in ${skill}. 
Return only the numbered sections, chapters, and bullet points with no introduction or summary. 
Do not include lines like 'Table of Contents:', motivational messages, or closing advice. 
Format it clearly with section titles and subtopics using Markdown-style hierarchy (e.g., I., 1.1, *, etc.).`;
    } else if (type === "content" && topic) {
      return `Generate educational content on the topic "${topic}" for the skill "${skill}" at a "${level}" understanding.

Divide the output into these four **clearly separated** sections, each with a heading:
1. Theory and Basics  
2. Real-Life Example  
3. Useful Commands / Functions  
4. Interview Questions with Answers

For improved readability:
- Use **bold** for important definitions or labels.
- Separate concepts with blank lines.
- Use fenced code blocks (\`\`\`language) for code and CLI commands.
- Start each section with its number and title (e.g., ## 1. Theory and Basics).
- Use bullet points with line breaks between items.
- Avoid **multiple asterisks inline**, and ensure clean Markdown.
- No intro/outro. Return just the formatted sections.`;

    }
    return "Invalid request.";
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: getPrompt() }] }],
          generationConfig: {
            temperature: 0.5,
          },
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json({
      result: data.candidates?.[0]?.content?.parts?.[0]?.text || "No result.",
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
