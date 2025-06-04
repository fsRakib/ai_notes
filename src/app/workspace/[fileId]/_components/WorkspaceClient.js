"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import WorkspaceHeader from "./WorkspaceHeader";
import PdfViewer from "./PdfViewer";
import TextEditor from "./TextEditor";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { Loader } from "./Loader";

export default function WorkspaceClient({
  fileId,
  room,
  usersData,
  currentUserType,
}) {
  const fileInfo = useQuery(api.fileStorage.GeFileRecord, {
    fileId,
  });

  useEffect(() => {
    console.log("fileInfo: ", fileInfo);
  }, [fileInfo]);
  console.log("WorkspaceClient fileName:", fileInfo?.fileName);
  console.log("WorkspaceClient roomId:", fileId);
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
          </div>{" "}
        </ClientSideSuspense>
      </RoomProvider>
    </div>
  );
}
