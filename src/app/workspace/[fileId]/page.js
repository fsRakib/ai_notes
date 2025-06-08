import { redirect } from "next/navigation";
import { getDocument } from "@/lib/actions/room.actions";
import { currentUser } from "@clerk/nextjs/server";
import { getClerkUsers } from "@/lib/actions/user.actions";
import WorkspaceClient from "./_components/WorkspaceClient";

export default async function WorkspacePage({ params }) {
  const { fileId } = await params;
 // console.log("WorkspacePage fileId:", fileId);
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/");

  const room = await getDocument({
    roomId: fileId,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });
  //console.log("page.js room:", room);

  const userIds = Object.keys(room.usersAccesses);
  //console.log("page.js userIds:", userIds);
  const users = await getClerkUsers({ userIds });
  //console.log("page.js users:", users);

  const usersData = users.map((user) => ({
    ...user,
    userType: room.usersAccesses[user.email]?.includes("room:write")
      ? "editor"
      : "viewer",
  }));
  //console.log("page.js usersData:", usersData);
  const currentUserType = room.usersAccesses[
    clerkUser.emailAddresses[0].emailAddress
  ].includes("room:write")
    ? "editor"
    : "viewer";
  //console.log("page.js currentUserType:", currentUserType);
  return (
    <WorkspaceClient
      fileId={fileId}
      room={room}
      usersData={usersData}
      currentUserType={currentUserType}
    />
  );
}
