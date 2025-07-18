//first the file array we set that user upload in the form using the state
//second we use the useUploadthing hook that we declared in the lib/utility function basically
//onHandleChange that just handle the field change basically the file upload it will help us setFile state
//onClick

"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { useState, useCallback, useRef } from "react";

import { Button } from "../ui/button";

const UploadComp = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  //we going to use the useUploadThing hook first we destructure -> startUpload, isUploading , permittedFileInfo from the hook first

  const { startUpload, isUploading, permittedFileInfo } = useUploadThing(
    "pdfUploader",
    {
      //inLine callback
      onClientUploadComplete: () => {
        alert("Upload Complete!");
        setFiles([]);
      },
      onUploadError: (error: Error) => {
        alert(`Upload Failed: ${error.message}`);
      },
    }
  );

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


  //

  return (
    <div className="w-full h-[85vh] mt-4 border border-dashed border-black rounded-xl bg-[#c6d8ff] flex justify-center items-center">
      <h2>Upload PDF</h2>

        <div>
            
        </div>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        multiple
        disabled={isUploading}
        className="cursor-pointer bg-gray-400"
      />

      <Button
        onClick={handleUpload}
        disabled={isUploading}
        variant={"secondary"}
        className="cursor-pointer font-inter"
      >
        {isUploading ? "Uploading ...." : "Upload"}
      </Button>

      {permittedFileInfo && (
        <p>
          {" "}
          Allowed File Types:{" "}
          {permittedFileInfo.config.pdf?.join(", ") || "PDF"}
        </p>
      )}
    </div>
  );
};

export default UploadComp;
