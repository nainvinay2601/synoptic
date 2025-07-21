"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Layers } from "lucide-react";

interface PdfResult {
  flashcards: {
    question: string;
    answer: string;
  }[];
  summary: string;
  pages?: number;
  extractedBy?: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<PdfResult | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "flashcards">(
    "summary"
  );
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const storedResult = localStorage.getItem("pdfProcessingResult");
    if (!storedResult) {
      router.push("/");
      return;
    }

    try {
      const parsedResult: PdfResult = JSON.parse(storedResult);
      setResult(parsedResult);
    } catch (error) {
      console.error("Failed to parse result:", error);
      router.push("/");
    }
  }, [router]);

  if (!result) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading results...</h1>
          <p>If this takes too long, please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Upload
        </Button>

        <div className="flex gap-2">
          <Button
            variant={activeTab === "summary" ? "default" : "outline"}
            onClick={() => setActiveTab("summary")}
            className="flex items-center gap-2"
          >
            <FileText size={16} />
            Summary
          </Button>
          <Button
            variant={activeTab === "flashcards" ? "default" : "outline"}
            onClick={() => setActiveTab("flashcards")}
            className="flex items-center gap-2"
          >
            <Layers size={16} />
            Flashcards ({result.flashcards.length})
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "summary" ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">PDF Summary</h2>
          <div className="prose max-w-none">
            {result.summary.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Flashcard Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentFlashcardIndex((prev) =>
                  prev > 0 ? prev - 1 : result.flashcards.length - 1
                );
                setShowAnswer(false);
              }}
            >
              Previous
            </Button>

            <span className="text-sm text-gray-500">
              Card {currentFlashcardIndex + 1} of {result.flashcards.length}
            </span>

            <Button
              variant="outline"
              onClick={() => {
                setCurrentFlashcardIndex((prev) =>
                  prev < result.flashcards.length - 1 ? prev + 1 : 0
                );
                setShowAnswer(false);
              }}
            >
              Next
            </Button>
          </div>

          {/* Current Flashcard */}
          <div
            className="bg-white rounded-lg shadow p-8 min-h-64 flex flex-col items-center justify-center cursor-pointer"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            <h3 className="text-xl font-medium mb-4 text-center">
              {result.flashcards[currentFlashcardIndex].question}
            </h3>

            {showAnswer && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg w-full">
                <p className="text-gray-700">
                  {result.flashcards[currentFlashcardIndex].answer}
                </p>
              </div>
            )}

            <p className="mt-4 text-sm text-gray-500">
              {showAnswer ? "Click to hide answer" : "Click to reveal answer"}
            </p>
          </div>

          {/* Flashcards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.flashcards.map((flashcard, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                  currentFlashcardIndex === index
                    ? "border-blue-500 bg-blue-50"
                    : ""
                }`}
                onClick={() => {
                  setCurrentFlashcardIndex(index);
                  setShowAnswer(false);
                }}
              >
                <h4 className="font-medium line-clamp-2">
                  {flashcard.question}
                </h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {flashcard.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
