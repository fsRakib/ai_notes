"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function DashboardClient({ sharedRooms }) {
  const { user } = useUser();
  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress,
  });

  return (
    <div className="p-4 ">
      <h2 className="text-3xl font-medium">Workspace</h2>
      {/* Created Documents */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {fileList === undefined ? (
          Array.from({
            length: (sharedRooms?.length || 0) > 0 ? sharedRooms.length : 3,
          }).map((_, idx) => (
            <div
              key={idx}
              className="h-40 animate-pulse bg-slate-200 rounded"
            ></div>
          ))
        ) : fileList?.length > 0 ? (
          fileList.map((file) => (
            <div
              key={file.fileId}
              className="shadow-lg p-4 rounded-lg bg-stone-200  items-center border-red-400 border-2 "
            >
              <Link
                href={`/workspace/${file.fileId}`}
                className="flex flex-col items-center group w-full"
              >
                <Image src="/pdf.png" width={50} height={50} alt="file" />
                <h2 className="mt-3 font-medium text-lg w-full text-center truncate">
                  {file.fileName}
                </h2>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">No documents found</p>
        )}
      </div>

      {/* Shared Documents */}
      <div className="mt-16">
        <h3 className="text-xl font-semibold mb-4">Shared With You</h3>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sharedRooms && sharedRooms.length > 0 ? (
            sharedRooms.map((room) => (
              <Link key={room.id} href={`/workspace/${room.id}`}>
                <div className="cursor-pointer shadow-lg p-4 rounded-lg flex flex-col items-center bg-stone-200 border-blue-700 border-2">
                  <Image
                    src="/pdf.png"
                    width={50}
                    height={50}
                    alt="shared file"
                  />
                  <h2 className="mt-3 font-medium text-lg w-full text-center truncate">
                    {room.metadata?.title || "Untitled"}
                  </h2>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500">No shared documents</p>
          )}
        </div>
      </div>
    </div>
  );
}
