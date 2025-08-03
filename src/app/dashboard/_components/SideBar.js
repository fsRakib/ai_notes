"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BotMessageSquareIcon, ChartAreaIcon, ChartBar, Layout, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import UploadPdfDialog from "./UploadPdfDialog";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { usePathname } from "next/navigation";
import Link from "next/link";

function SideBar() {
  const { user } = useUser();

  const path = usePathname();
  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress,
  });
  return (
    <div className="shadow-md h-screen  p-7 rounded-xl">
      <div className=" w-full justify-center flex">
        <Image src="/logo.png" width={120} height={120} alt="logo" />
      </div>

      <div className="mt-10">
        <UploadPdfDialog isMaxFile={fileList?.length >= 5 ? true : false}>
          <Button className="w-full">+Upload Pdf</Button>
        </UploadPdfDialog>
      </div>
      <Link href="/dashboard">
        <div
          className={` flex gap-2 items-center p-3 mt-5 hover:bg-stone-200 cursor-pointer ${path == "/dashboard" && "bg-stone-200"}`}
        >
          <Layout />
          <h2>Workspace</h2>
        </div>
      </Link>
      <Link href="/dashboard/chat">
        <div
          className={`flex gap-2 items-center p-3 mt-1 hover:bg-stone-200 cursor-pointer ${path == "/dashboard/upgrade" && "bg-stone-200"}`}
        >
          <BotMessageSquareIcon />
          <h2>Chat</h2>
        </div>
      </Link>
      <Link href="/dashboard/upgrade">
        <div
          className={`flex gap-2 items-center p-3 mt-1 hover:bg-stone-200 cursor-pointer ${path == "/dashboard/upgrade" && "bg-stone-200"}`}
        >
          <Shield />
          <h2>Upgrade</h2>
        </div>
      </Link>
      <div className="absolute bottom-24 w-[80%]">
        <Progress value={(fileList?.length / 5) * 100} />
        <p className="text-sm mt-1">{fileList?.length} out of 5 Pdf Uploaded</p>
        <p className="text-sm mt-2 text-gray-400">Upgrade to uoload ore</p>
      </div>
    </div>
  );
}

export default SideBar;
