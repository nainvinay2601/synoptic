// types/pdf.ts

export interface Flashcard {
  question: string;
  answer: string;
}

export interface ProcessedPDFData {
  fileName: string;
  summary: string;
  flashcards: Flashcard[];
  processedAt: string;
}

export interface APIResponse {
  success: boolean;
  data?: ProcessedPDFData;
  error?: string;
}

export interface PDFUploadState {
  isUploading: boolean;
  isProcessing: boolean;
  error: string | null;
  data: ProcessedPDFData | null;
}