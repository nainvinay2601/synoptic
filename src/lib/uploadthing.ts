// uploadthing.ts
import { OurFileRouter } from "@/app/api/uploadthing/route";
import { generateReactHelpers } from "@uploadthing/react";


export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
