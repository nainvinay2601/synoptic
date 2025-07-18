//Step-1 Imports

import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Get the userid from clerk

const getUserId = (req: NextRequest) => {
  const { userId } = getAuth(req);
  if (!userId) throw new UploadThingError("Unauthorized");
  return userId;
};

export const OurFileRouter = {
  pdfUploader: f({
    pdf: { maxFileSize: "4MB" },
  })
    //middleware to get the userID
    .middleware(async (opts) => {
      const userId = getUserId(opts.req);
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(`Upload Complete for userId:, ${metadata.userId}`);
      console.log("File Url:", file.ufsUrl);

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof OurFileRouter;
