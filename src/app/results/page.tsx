// app/results/page.tsx
"use client";
import { useEffect, useState } from "react";

interface PdfProcessingResult {
  summary: string;
  pages: number;
  tokenUsed?: number;
  fileName: string;
  processedAt: string;
}

export default function ResultsPage() {
  const [result, setResult] = useState<PdfProcessingResult | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("pdfProcessingResult");
    if (!storedData) {
      window.location.href = "/";
      return;
    }
    setResult(JSON.parse(storedData));
  }, []);

  if (!result) return <div className="p-4">Loading results...</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">
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
    </div>
  );
}
