import Image from "next/image";
import { useState } from "react";

import {
  removeCollaborator,
  updateDocumentAccess,
} from "@/lib/actions/room.actions";

import { Button } from "@/components/ui/button";
import { UserTypeSelector } from "@/app/workspace/[fileId]/_components/UserTypeSelector";

export const Collaborator = ({
  roomId,
  creatorId,
  collaborator,
  email,
  user,
}) => {
  const [userType, setUserType] = useState(collaborator.userType || "viewer");
  const [loading, setLoading] = useState(false);

  const shareDocumentHandler = async (type) => {
    setLoading(true);

    try {
      await updateDocumentAccess({
        roomId,
        email,
        userType: type,
        updatedBy: user,
      });
    } catch (error) {
      console.log("Error notif:", error);
    }

    setLoading(false);
  };

  const removeCollaboratorHandler = async (email) => {
    setLoading(true);
    try {
      await removeCollaborator({ roomId, email });
    } catch (error) {
      console.log("Error notif:", error);
    }
    setLoading(false);
  };

  return (
    <li className="flex items-center justify-between gap-2 py-3">
      <div className="flex gap-2">
        <Image
          src={collaborator.avatar}
          alt="avatar"
          width={36}
          height={36}
          className="size-9 rounded-full"
        />
        <div>
          <p className="line-clamp-1 text-sm font-semibold leading-4 text-white">
            {collaborator.name}
            <span className="text-10-regular pl-2 text-black">
              {loading && "updating..."}
            </span>
          </p>
          <p className="text-sm font-light text-black">{collaborator.email}</p>
        </div>
      </div>

      {creatorId === collaborator.id ? (
        <p className="text-sm font-light text-black">Owner</p>
      ) : (
        <div className="flex items-center gap-2">
          <UserTypeSelector
            userType={userType}
            setUserType={setUserType || "viewer"}
            onClickHandler={shareDocumentHandler}
          />
          <Button
            type="button"
            onClick={() => removeCollaboratorHandler(collaborator.email)}
            disabled={loading}
            className="border rounded-lg px-2 bg-transparent text-red-500 hover:bg-transparent"
          >
            {loading ? "Removing..." : "Remove"}
          </Button>
        </div>
      )}
    </li>
  );
};
