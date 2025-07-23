// app/results/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react"; // Import an icon
import { Button } from "@/components/ui/button";

interface PdfProcessingResult {
  summary: string;
  pages: number;
  tokenUsed?: number;
  fileName: string;
  processedAt: string;
}

export default function ResultsPage() {
  const [result, setResult] = useState<PdfProcessingResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedData = sessionStorage.getItem("pdfProcessingResult");
    if (!storedData) {
      window.location.href = "/";
      return;
    }
    setResult(JSON.parse(storedData));
  }, []);

  const handleGoBack = () => {
    router.push("/"); // Navigates to home page
  };

  if (!result) return <div className="p-4">Loading results...</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Back Button */}
      {/* <button
        onClick={handleGoBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        aria-label="Go back to home page"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Home
      </button> */}

      {/* Results Content */}
      <h1 className="text-3xl font-bold mb-2">
        {result.fileName} - Analysis Results
      </h1>
      <div className="text-sm text-gray-500 mb-6">
        {result.pages} pages • Processed on{" "}
        {new Date(result.processedAt).toLocaleString()}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Key Summary</h2>
        <div className="whitespace-pre-line">{result.summary}</div>
      </div>

      {/* Secondary Back Button at bottom */}
      <Button
        onClick={handleGoBack}
        // className="mt-8 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center"

        className="mt-8 bg-blue-300 h-[42px] font-medium rounded-full"

        variant={"outline"}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Process Another PDF
      </Button>
    </div>
  );
}
