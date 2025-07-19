import axios from "axios";
import { NextResponse } from "next/server";

import pdf from "pdf-parse";

//* Step1- Import pdfURl
//* 2- fetch pdf
//* 3- parse pdf
//* 4- return the text

export async function POST(request: Request) {
  try {
    //Get The PDF URL from the request
    const { pdfUrl } = await request.json();
    if (!pdfUrl) {
      return NextResponse.json(
        {
          error: " No PDF URL Provided",
        },
        { status: 400 }
      );
    }

    //* Step -2  Fetch the pdf

    const response = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
    });

    //* Parse the pdf
    const data = await pdf(response.data);

    //* Return the text
    return NextResponse.json({
      text: data.text,
      pages: data.numpages,
      info: data.info,
    });
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json(
      {
        error: "Failed To Parse PDF",
      },
      {
        status: 500,
      }
    );
  }
}
