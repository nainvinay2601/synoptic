import { NextRequest, NextResponse } from "next/server";

import { GoogleGenerativeAI } from "@google/generative-ai";

//Initialise the Gemini AI

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    //Get the extracted text from the body first
    const { text, fileName } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "No Text Content Provided" },
        {
          status: 400,
        }
      );
    }

    //Initialize the gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    //Create prompt for the flashcard and the pdf summary
    const summaryPrompt = `Please provide a comprehensive summary for the provided text. Focus on the key concepts, main ideas, and important details: ${text}`;
    const flashCardPrompt = `Based on the provided text, create 10 flashcards for studying. Format each flashcard as a JSON Object with "question" and  "answer" field. Return only a valid JSON array of flashcards: ${text} `;

    //Generate Summary
    console.log("Generating the summary ...");
    const summaryResult = await model.generateContent(summaryPrompt);
    const summary = summaryResult.response.text();

    //Generate Flash Card
    console.log("Generating Flash Cards");
    const flashCardsResult = await model.generateContent(flashCardPrompt);
    let flashcards = [];

    try {
      const flashcardText = flashCardsResult.response.text();
      //Clean up the respone
      const cleanedText = flashcardText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      flashcards = JSON.parse(cleanedText);
    } catch (parseError) {
      console.log("Error Parsing FlashCards", parseError);
      //Fallback response instead of the empty array
      flashcards = [
        {
          question: "What are the main topics covered in this document?",
          answer: "Please refer to the summary for key topics and concepts",
        },
      ];
    }

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        summary,
        flashcards,
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.log("Error while processing the PDF", error);

    return NextResponse.json(
      { error: "Failed to generate summary and the flashcards ..." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "PDF Processing API Is running",
    status: "active",
  });
}
