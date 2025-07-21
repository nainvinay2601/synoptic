import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import pdf from "pdf-parse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pdfUrl } = await request.json();
    if (!pdfUrl)
      return NextResponse.json(
        { error: "No PDF URL provided" },
        { status: 400 }
      );

    // Fetch and parse PDF
    const response = await fetch(pdfUrl);
    const buffer = await response.arrayBuffer();
    const data = await pdf(Buffer.from(buffer));
    const { text } = data;
    if (!text?.trim()) {
      console.log("Parsed pdf dont have extractable text");
      return NextResponse.json({ error: "No text extracted" }, { status: 400 });
    }

    // Process with OpenAI
    const [flashcards, summary] = await Promise.all([
      generateFlashcards(text),
      generateSummary(text),
    ]);

    return NextResponse.json({
      success: true,
      flashcards,
      summary,
      pages: data.numpages,
    });
  } catch (error) {
    console.error("PDF processing error:", error);
    return NextResponse.json(
      {
        error: "Failed to process PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// AI Helper Functions
async function generateFlashcards(text: string) {
  try {
    const truncatedText = text.slice(0, 6000);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates educational flashcards from provided text.",
        },
        {
          role: "user",
          content: `Create 10 high-quality flashcards from this text in JSON format. Each should have:
                    - Clear, concise question
                    - Detailed, accurate answer
                    - Focus on key concepts
                    
                    Text: ${truncatedText}
                    
                    Return format: {
                      "flashcards": [
                        {
                          "question": "...",
                          "answer": "..."
                        }
                      ]
                    }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received from OpenAI");

    const parsed = JSON.parse(content);
    return parsed.flashcards || [];
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return [];
  }
}

async function generateSummary(text: string) {
  try {
    const truncatedText = text.slice(0, 6000);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates comprehensive summaries of academic texts.",
        },
        {
          role: "user",
          content: `Create a 3-paragraph professional summary of this text:
                    - First paragraph: Main arguments/theses
                    - Second paragraph: Key findings
                    - Third paragraph: Important conclusions
                    
                    Text: ${truncatedText}`,
        },
      ],
      temperature: 0.2,
    });

    return response.choices[0].message.content || "No summary generated";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Failed to generate summary";
  }
}
