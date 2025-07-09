"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import WorkspaceHeader from "./WorkspaceHeader";
import PdfViewer from "./PdfViewer";
import TextEditor from "./TextEditor";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react"; // Import icons from lucide-react

export default function WorkspaceClient({
  fileId,
  room,
  usersData,
  currentUserType,
}) {
  const [pdfVisible, setPdfVisible] = useState(true);

  const fileInfo = useQuery(api.fileStorage.GetFileRecord, { fileId });

  useEffect(() => {
    if (fileInfo === undefined) {
      console.warn("fileInfo is undefined. Waiting for data or query failed.");
    } else if (fileInfo === null) {
      console.error("fileInfo is null: no matching file found in DB.");
    } else {
      console.log("Loaded fileInfo: ", fileInfo);
    }
  }, [fileInfo]);

  return (
    <div className="relative">
      <RoomProvider id={fileId}>
        <ClientSideSuspense fallback={<Loader />}>
          <WorkspaceHeader
            fileName={fileInfo?.fileName}
            roomId={fileId}
            roomMetadata={room.metadata}
            users={usersData}
            currentUserType={currentUserType}
          />

          <div
            className={`grid ${pdfVisible ? "grid-cols-2" : "grid-cols-1"} gap-5`}
          >
            <div>
              <TextEditor
                fileId={fileId}
                pdfVisible={pdfVisible}
                setPdfVisible={setPdfVisible}
              />
            </div>
            {pdfVisible && <PdfViewer fileUrl={fileInfo?.fileUrl} />}
          </div>
        </ClientSideSuspense>
      </RoomProvider>
    </div>
  );
}
