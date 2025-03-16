import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";

function WorkspaceHeader({ fileName }) {
  return (
    <div className="p-4 flex justify-between shadow-md">
      <Image src={"/logo.png"} alt="logo" width={50} height={50} />
      <h2 className="font-bold">{fileName}</h2>
      <div className="flex gap-2 items-center">
        <Button>Save</Button>

        <UserButton />
      </div>
    </div>
  );
}

export default WorkspaceHeader;
