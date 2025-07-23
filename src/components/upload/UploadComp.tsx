//first the file array we set that user upload in the form using the state
//second we use the useUploadthing hook that we declared in the lib/utility function basically
//onHandleChange that just handle the field change basically the file upload it will help us setFile state
//onClick

"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { useState, useCallback, useRef } from "react";

import { Button } from "../ui/button";
import { File, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const UploadComp = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  //we going to use the useUploadThing hook first we destructure -> startUpload, isUploading , permittedFileInfo from the hook first

  const { startUpload, isUploading, permittedFileInfo } = useUploadThing(
    "pdfUploader",
    {
      //inLine callback
      onClientUploadComplete: (res) => {
        if (!res?.[0]?.ufsUrl) {
          toast.error("Upload Complete but the no URL Returned ");
          return;
        }

        processPdf(res[0].ufsUrl);
      },
      onUploadError: (error: Error) => {
        toast.error(`Upload Failed: ${error.message}`);
      },
    }
  );

  //Process The PDF
  // const processPdf = async (pdfUrl: string) => {
  //   setIsProcessing(true);
  //   const toastId = toast.loading("Processing PDF ... ");
  //   try {
  //     console.log("Starting to process PDF", pdfUrl);

  //     const response = await fetch(`/api/process-pdf`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         pdfUrl,
  //         fileName: files[0]?.name || "document.pdf", // Add a file name
  //       }),
  //     });

  //     console.log("response Received", response);

  //     if (!response.ok) {
  //       const error = await response.json();
  //       throw new Error(error.error || "Processing Failed");
  //     }

  //     const result = await response.json();
  //     console.log("PDF RESULT", result);
  //     localStorage.setItem("pdfProcessingResult:", JSON.stringify(result));
  //     toast.success("PDF Processed Successfully", { id: toastId });
  //     router.push("/results");
  //   } catch (error: any) {
  //     toast.error(error.message || "Failed To Process The PDF Sorry ://");
  //   } finally {
  //     setIsProcessing(false);
  //     setFiles([]);
  //   }
  // };

  const processPdf = async (pdfUrl: string) => {
    setIsProcessing(true);
    const toastId = toast.loading("Analyzing PDF Content ...");
    try {
      console.log("Initiating PDF Processing For:", pdfUrl);

      // * 1. Send request to processing API
      const response = await fetch("/api/process-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfUrl,
          fileName: files[0]?.name || "document.pdf",
        }),
      });

      console.log("API RESPONSE STATUS:", response.status);

      //* 2  Handle the NON-Ok response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Processing Error:", errorData);

        throw new Error(
          errorData.error ||
            errorData.message ||
            `Server respond with ${response.status}`
        );
      }

      //* 3 Process Successful response
      const result = await response.json();
      console.log("Processing Result:", {
        summary: result.summary?.substring(0, 100) + "...",
        pages: result.pages,
        tokens: result.tokenUsed,
      });

      //* 4 Store the Result and navigate
      sessionStorage.setItem(
        "pdfProcessingResult",
        JSON.stringify({
          ...result,
          fileName: files[0]?.name || "document.pdf",
          processedAt: new Date().toISOString(),
        })
      );

      toast.success("Analysis Complete!", {
        id: toastId,
        description: `${result.pages} page processed`,
      });
      // * 5  Redirect to result page
      router.push("/results");
    } catch (error: any) {
      console.error("PDF processing failed:", error);
      toast.error("Analysis failed", {
        id: toastId,
        description: error.message || "Please try a different PDF file",
      });
    } finally {
      setIsProcessing(false);
      setFiles([]);
    }
  };

  //Set the files onChange function now

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // set the onClick function
  const handleUpload = async () => {
    if (files.length > 0) {
      await startUpload(files); // if the files exist then use the startUpload
    }
  };

  //Remove the file if upload is wrong

  const onRemove = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // What happens when Drag Enters
  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  // What happens when Drag Leaves
  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  // What happens when Drag Enters
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  //Trigger file input when drag div is clicked
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isLoading = isUploading || isProcessing;

  return (
    <div className=" mt-4  rounded-xl  font-inter ">
      {/* Heading  */}
      <h2 className="text-[24px] font-bold">Upload PDF</h2>

      {/* Dragging Area */}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors h-[50vh] flex justify-center items-center flex-col ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-500 bg-gray-200"
        }`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={triggerFileInput}
      >
        <Upload className="mx-auto text-3xl text-black mb-3" />
        <p className="text-black mb-1">
          {isDragging
            ? "Drop Your Files Here ://"
            : "Drag & Drop Your Files here or click to browse :) "}
        </p>
        <p className="text-sm text-gray-500">
          {permittedFileInfo?.config?.pdf
            ? `Supports: ${permittedFileInfo.config.pdf
                .map((ext) => `.${ext}`)
                .join(", ")}`
            : "Supports: PDF Files"}
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        multiple
        disabled={isLoading}
        className="hidden"
      />

      {/* File Preview */}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="font-medium text-gray-700 font-inter">
            Selected Files:
          </h3>
          <div className="max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between  p-2  bg-gray-50  rounded"
              >
                <div className="flex items-center">
                  <File className="text-gray-500  mr-2 " />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                </div>
                <Button
                  variant={"outline"}
                  onClick={() => onRemove(index)}
                  className="text-gray-500 hover:text-red-500"
                  disabled={isLoading}
                >
                  <X />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Button to handle the file upload  */}

      <Button
        variant={"outline"}
        onClick={handleUpload}
        disabled={isLoading || files.length === 0}
        className={`mt-4  w-full  py-4 h-[48px]  font-inter  rounded-md  flex  items-center  justify-center ${
          isLoading
            ? "bg-blue-300  cursor-not-allowed"
            : files.length === 0
            ? "bg-gray-300  cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700  text-white"
        }`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Uploading ...
          </>
        ) : (
          <>
            <Upload className="mr-2" />
            Upload {files.length > 0 ? `(${files.length})` : ""}
          </>
        )}
      </Button>
    </div>
  );
};

export default UploadComp;
