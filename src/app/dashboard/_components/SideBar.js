"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Layout, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import UploadPdfDialog from "./UploadPdfDialog";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

function SideBar() {
  const { user } = useUser();

  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress,
  });
  return (
    <div className="shadow-md h-screen  p-7">
      <div className="bg-gray-700 w-full justify-center flex">
        <Image src="/logo.png" width={120} height={120} alt="logo" />
      </div>

      <div className="mt-10">
        <UploadPdfDialog isMaxFile={fileList?.length >= 5 ? true : false}>
          <Button className="w-full">+Upload Pdf</Button>
        </UploadPdfDialog>
      </div>

      <div className="flex gap-2 items-center p-3 mt-5 hover:bg-slate-100 cursor-pointer">
        <Layout />
        <h2>Workspace</h2>
      </div>
      <div className="flex gap-2 items-center p-3 mt-1 hover:bg-slate-100 cursor-pointer">
        <Shield />
        <h2>Upgrade</h2>
      </div>
      <div className="absolute bottom-24 w-[80%]">
        <Progress value={(fileList?.length / 5) * 100} />
        <p className="text-sm mt-1">{fileList?.length} out of 5 Pdf Uploaded</p>
        <p className="text-sm mt-2 text-gray-400">Upgrade to uoload ore</p>
      </div>
    </div>
  );
}

export default SideBar;
