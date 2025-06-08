"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import WorkspaceHeader from "./WorkspaceHeader";
import PdfViewer from "./PdfViewer";
import TextEditor from "./TextEditor";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import Loader from "@/components/Loader";

export default function WorkspaceClient({
  fileId,
  room,
  usersData,
  currentUserType,
}) {
  console.log("WorkspaceClient fileId:", fileId);
  const fileInfo = useQuery(api.fileStorage.GetFileRecord, {
    fileId
  });

  // useEffect(() => {
  //   console.log("fileInfo: ", fileInfo);
  // }, [fileInfo]);
  useEffect(() => {
    if (fileInfo === undefined) {
      console.warn("fileInfo is undefined. Waiting for data or query failed.");
    } else if (fileInfo === null) {
      console.error("fileInfo is null: no matching file found in DB.");
    } else {
      console.log("Loaded fileInfo: ", fileInfo);
    }
  }, [fileInfo]);
  

  console.log("WorkspaceClient roomMetadata:", room.metadata);
  console.log("WorkspaceClient users:", usersData);
  console.log("WorkspaceClient currentUserType:", currentUserType);
  return (
    <div>
      <RoomProvider id={fileId}>
        <ClientSideSuspense fallback={<Loader />}>
          <WorkspaceHeader
            fileName={fileInfo?.fileName}
            roomId={fileId}
            roomMetadata={room.metadata}
            users={usersData}
            currentUserType={currentUserType}
          />
          <div className="grid grid-cols-2 gap-5">
            <div>
              <TextEditor fileId={fileId} />
            </div>
            <div>
              <PdfViewer fileUrl={fileInfo?.fileUrl} />
            </div>
          </div>
        </ClientSideSuspense>
      </RoomProvider>
    </div>
  );
}
