import { SignedIn, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { ShareModal } from "./ShareModal";
import { ActiveCollaborators } from "./ActiveCollaborators";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "../../.../../../../../convex/_generated/api";
import { useRoom } from "@liveblocks/react";
import { updateDocument } from "@/lib/actions/room.actions";

function WorkspaceHeader({
  fileName,
  roomId,
  users,
  roomMetadata,
  currentUserType,
}) {
  const [documentTitle, setDocumentTitle] = useState(fileName);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const updateFileName = useMutation(api.fileStorage.updateFileName);
  const room = useRoom();

  const updateTitleHandler = async (e) => {
    if (e.key === "Enter") {
      setLoading(true);

      try {
        if (documentTitle !== roomMetadata.title) {
          await updateFileName({
            fileId: roomId,
            newFileName: documentTitle,
          });
          await updateDocument(roomId, documentTitle);
          setEditing(false);
        }
      } catch (error) {
        console.error("Error updating file name:", error);
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <div className="p-4 flex justify-between shadow-md">
      <Image src={"/logo.png"} alt="logo" width={50} height={50} />

      <div
        ref={containerRef}
        className="flex w-fit items-center justify-center gap-2 lg:flex-1"
      >
        {editing && !loading ? (
          <Input
            type="text"
            value={documentTitle}
            ref={inputRef}
            placeholder="Enter title"
            onChange={(e) => setDocumentTitle(e.target.value)}
            onKeyDown={(e) => updateTitleHandler(e)}
            disabled={!editing}
            className="min-w-[78px] flex-1 border-none bg-transparent px-0 text-left text-base font-semibold leading-[24px] focus-visible:ring-0 focus-visible:ring-offset-0 disabled:text-black sm:text-xl md:text-center"
          />
        ) : (
          <>
            <p className="line-clamp-1 border-dark-400 text-base font-semibold leading-[24px] sm:pl-0 sm:text-xl">
              {documentTitle}
            </p>
          </>
        )}

        {/* Edit icon trigger */}
        {currentUserType === "editor" && !editing && (
          <Image
            src="/assets/icons/edit.svg"
            alt="edit"
            width={24}
            height={24}
            onClick={() => setEditing(true)}
            className="cursor-pointer"
          />
        )}

        {/* View only user indicator */}
        {currentUserType !== "editor" && !editing && (
          <p className="view-only-tag">View only</p>
        )}

        {/* Saving title indicator */}
        {loading && <p className="text-sm text-gray-400">saving...</p>}
      </div>

      {/* Collaborators & Actions */}
      <div className="flex  justify-end gap-2 sm:gap-3 ">
        <ActiveCollaborators />
        <ShareModal
          roomId={roomId}
          collaborators={users}
          creatorId={roomMetadata.creatorId}
          currentUserType={currentUserType}
        />
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}

export default WorkspaceHeader;
