import { currentUser } from "@clerk/nextjs/server";
import { liveblocks } from "@/lib/liveblocks";
import { getUserColor } from "@/lib/utils";

export async function POST(req) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = {
    id: clerkUser.id,
    info: {
      id: clerkUser.id,
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`,
      email: clerkUser.emailAddresses[0].emailAddress,
      avatar: clerkUser.imageUrl,
      color: getUserColor(clerkUser.id),
    },
  };

  const { status, body } = await liveblocks.identifyUser(
    {
      userId: user.info.email,
      groupIds: [],
    },
    { userInfo: user.info }
  );

  //return new Response(body, { status });
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
