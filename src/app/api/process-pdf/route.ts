import { NextResponse, NextRequest } from "next/server";
import { Groq } from "groq-sdk";
import { getAuth } from "@clerk/nextjs/server";
import pdf from "pdf-parse";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let lastRequestTime = 0;
const REQUEST_DELAY = 5000; // 5 seconds between requests

export async function POST(request: NextRequest) {
  console.log("---------- NEW PDF PROCESSING REQUEST STARTED ----------");

  try {
    // 1. Validate User
    console.log("[1/5] Authenticating user...");
    const { userId } = getAuth(request);

    if (!userId) {
      console.error("Authentication failed: No user ID found");
      return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });
    }
    console.log(`✓ Authenticated user: ${userId}`);

    // 2. Validate PDF URL
    console.log("[2/5] Validating request...");
    const { pdfUrl } = await request.json();
    if (!pdfUrl) {
      console.error("Validation failed: No PDF URL provided");
      return NextResponse.json({ error: "No PDF URL found" }, { status: 400 });
    }
    console.log(`✓ PDF URL received: ${pdfUrl.substring(0, 50)}...`);

    // 3. Fetch and parse PDF
    console.log("[3/5] Fetching and parsing PDF...");
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      console.error(`PDF fetch failed with status: ${response.status}`);
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const pdfData = await pdf(Buffer.from(buffer));

    if (!pdfData.text?.trim()) {
      console.error("PDF parsing failed: No extractable text found");
      return NextResponse.json(
        { error: "PDF contains no text" },
        { status: 400 }
      );
    }

    const text = pdfData.text.slice(0, 12000);
    console.log(
      `✓ PDF parsed successfully. Pages: ${
        pdfData.numpages
      }, Text sample:\n${text.substring(0, 150)}...`
    );

    // 4. Rate limiting
    console.log("[4/5] Checking rate limits...");
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < REQUEST_DELAY) {
      const waitTime = REQUEST_DELAY - timeSinceLastRequest;
      console.log(`⏳ Rate limit active. Waiting ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // 5. Generate Summary
    console.log("[5/5] Generating summary with Groq...");
    lastRequestTime = Date.now();

    const summaryResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an academic assistant that creates concise, accurate summaries focusing on key information.",
        },
        {
          role: "user",
          content: `Create a 3-paragraph summary of this document:\n\n${text}`,
        },
      ],
      model: "llama3-70b-8192",
      temperature: 0.3,
      max_tokens: 1000,
    });

    const summary = summaryResponse.choices[0]?.message?.content;
    console.log("✓ Summary generated successfully:");
    console.log("----------------------------------------");
    console.log(summary);
    console.log("----------------------------------------");
    console.log(`Token usage: ${summaryResponse.usage?.total_tokens}`);

    return NextResponse.json({
      success: true,
      summary,
      pages: pdfData.numpages,
      tokenUsed: summaryResponse.usage?.total_tokens,
    });
  } catch (error) {
    console.error("!!! PROCESSING FAILED !!!");
    console.error(error instanceof Error ? error.message : "Unknown error");

    return NextResponse.json(
      {
        error: "Failed to summarize PDF",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    console.log("---------- REQUEST PROCESSING COMPLETE ----------\n");
  }
}
