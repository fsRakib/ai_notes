import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSharedRooms } from "@/lib/actions/room.actions";
import DashboardClient from "./_components/DashboardClient";

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return redirect("/sign-in");

  const email = clerkUser.emailAddresses[0].emailAddress;
  const sharedRooms = await getSharedRooms(email);

  return <DashboardClient sharedRooms={sharedRooms} />;
}
