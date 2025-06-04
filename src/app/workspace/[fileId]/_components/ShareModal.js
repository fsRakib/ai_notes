"use client";

import { useSelf } from "@liveblocks/react/suspense";
import Image from "next/image";
import { useState } from "react";
import { updateDocumentAccess } from "@/lib/actions/room.actions";
import { Collaborator } from "@/app/workspace/[fileId]/_components/Collaborator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserTypeSelector } from "@/app/workspace/[fileId]/_components/UserTypeSelector";

export const ShareModal = ({
  roomId,
  collaborators,
  creatorId,
  currentUserType,
}) => {
  const user = useSelf();
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("viewer");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const shareDocumentHandler = async () => {
    setLoading(true);

    try {
      const room = await updateDocumentAccess({
        roomId,
        email,
        userType: userType,
        updatedBy: user.info,
      });

      if (room) setEmail("");
    } catch (error) {
      console.log("Error notif:", error);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gradient-blue flex h-9 gap-1 px-4"
          disabled={currentUserType !== "editor"}
        >
          <Image
            src="/assets/icons/share.svg"
            alt="share"
            width={20}
            height={20}
            className="min-w-4 md:size-5"
          />
          <p className="mr-1 hidden sm:block">Share</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog">
        <DialogHeader>
          <DialogTitle>Manage who can view this project</DialogTitle>
          <DialogDescription>
            Select which users can access and view this project.
          </DialogDescription>
        </DialogHeader>

        <Label htmlFor="email" className="mt-6 text-black">
          Email address
        </Label>
        <div className=" flex items-center gap-3">
          <div className="flex flex-1 rounded-md bg-dark-400 gap-2">
            <Input
              id="email"
              placeholder="Enter email address"
              value={email}
              className="h-11 flex-1 border bg-dark-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) => setEmail(e.target.value)}
            />
            <UserTypeSelector userType={userType} setUserType={setUserType} />
          </div>
          <Button
            type="submit"
            onClick={shareDocumentHandler}
            className="gradient-blue flex h-full gap-1 px-5"
          >
            {loading ? "Sending..." : "Invite"}
          </Button>
        </div>

        <div className="my-2 space-y-2">
          <ul className="flex flex-col">
            {collaborators.map((collaborator, i) => (
              <Collaborator
                key={collaborator.id + 1}
                roomId={roomId}
                creatorId={creatorId}
                email={collaborator.email}
                collaborator={collaborator}
                user={user.info}
              />
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
