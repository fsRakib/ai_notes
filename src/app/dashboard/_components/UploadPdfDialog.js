"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader2Icon } from "lucide-react";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { createDocument } from "@/lib/actions/room.actions";

function UploadPdfDialog({ children, isMaxFile }) {
  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
  const addFileEntry = useMutation(api.fileStorage.AddFileEntryToDb);
  const getFileZUrl = useMutation(api.fileStorage.getFileUrl);
  const embeddDocument = useAction(api.myActions.ingest);
  const { user } = useUser();
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState();
  const [open, setOpen] = useState(false);

  const OnFileSelect = (event) => {
    setFile(event.target.files[0]);
  };
  const OnUpload = async () => {
    setLoading(true);

    try {
      // Step 1: Get a short-lived upload URL
      const postUrl = await generateUploadUrl();
      // Step 2: POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file?.type },
        body: file,
      });

      const { storageId } = await result.json();
      console.log("StorageId", storageId);
      const fileId = uuid4();
      const fileUrl = await getFileZUrl({ storageId: storageId });
      // Step 3: Save the newly allocated storage id to the database
      const res = await addFileEntry({
        fileId: fileId,
        storageId: storageId,
        fileName: fileName ?? "Untitled file",
        fileUrl: fileUrl,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });
      // console.log(res);

      //API call to fetch PDF process data
      const APIresponse = await fetch("/api/pdf-loader?pdfUrl=" + fileUrl, {
        method: "GET",
      });
      const data = await APIresponse.json();
      console.log(
        "/dashboard/_components/UploadPdfDialog.js -Extracted Split Text: ",
        data.result
      );
      await embeddDocument({
        splitText: data.result,
        fileId: fileId,
      });

      const room = await createDocument({
        userId: user?.id,
        email: user?.primaryEmailAddress?.emailAddress,
        fileName,
        roomId: fileId,
      });
      // console.log(embeddResult);
      // setLoading(false);
      setOpen(false);

      toast("File is ready...");
    } catch (error) {
      console.error("Upload error:", error);
      toast("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          disabled={isMaxFile}
          className="w-full"
        >
          +Upload PDF File
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Pdf File</DialogTitle>
          <DialogDescription asChild>
            <div className="">
              <h2 className="mt-5">Select your file</h2>
              <div className="gap-2 p-3 border rounded-md">
                <input
                  type="file"
                  onChange={OnFileSelect}
                  accept="application/pdf"
                />
              </div>
              <div className="mt-2">
                <label>File Name *</label>
                <Input
                  placeholder="File name"
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button onClick={OnUpload} disabled={loading}>
            {loading ? <Loader2Icon className="animate-spin" /> : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UploadPdfDialog;
