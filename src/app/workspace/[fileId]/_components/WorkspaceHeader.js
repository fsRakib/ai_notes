import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";

function WorkspaceHeader() {
  return (
    <div className="p-4 flex justify-between shadow-md">
      <Image src={"/logo.png"} alt="logo" width={50} height={50} />
      <UserButton />
     
    </div>
  );
}

export default WorkspaceHeader;
