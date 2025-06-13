// "use client";
// import { useUser } from "@clerk/nextjs";
// import { useQuery } from "convex/react";
// import React, { useEffect, useState } from "react";
// import { api } from "../../../convex/_generated/api";
// import Image from "next/image";
// import Link from "next/link";
// import { getSharedRoomsForClient } from "@/lib/sharedRooms";


// function Dashboard() {
//   const { user } = useUser();
//   const [sharedRooms, setSharedRooms] = useState([]);
//   const fileList = useQuery(api.fileStorage.GetUserFiles, {
//     userEmail: user?.primaryEmailAddress?.emailAddress,
//   });
//   useEffect(() => {
//     const fetchShared = async () => {
//       const email = user?.primaryEmailAddress?.emailAddress;
//       if (!email) return;

//       const rooms = await getSharedRoomsForClient(email);
//       setSharedRooms(rooms || []);
//     };

//     fetchShared();
//   }, [user]);
//   console.log("fileList", fileList);

//   return (
//     <div className="p-4 ">
//       <h2 className="font-medium text-3xl">Workspace</h2>

//       <div className=" grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-10">
//         {fileList?.length > 0
//           ? fileList?.map((file, index) => (
//               <Link key={index} href={`/workspace/` + file?.fileId}>
//                 <div className="cursor-pointer hover:scale-105 transition-all flex p-5 shadow-md rounded-md flex-col items-center justify-center border">
//                   <Image src={"/pdf.png"} alt="file" width={50} height={50} />
//                   <h2 className="mt-3 font-medium text-lg">{file?.fileName}</h2>
//                   {/* <h2>{file?.createdBy}</h2> */}
//                 </div>
//               </Link>
//             ))
//           : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((file, index) => (
//               <div
//                 key={index}
//                 className="bg-slate-200 rounded-md h-[150px] animate-pulse"
//               ></div>
//             ))}
//       </div>

//       {/* Shared with you */}
//       <div className="mt-16">
//         <h3 className="text-xl font-semibold mb-4">Shared With You</h3>
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
//           {sharedRooms?.length > 0 ? (
//             sharedRooms.map((room, index) => (
//               <Link key={index} href={`/workspace/${room.id}`}>
//                 <div className="cursor-pointer hover:scale-105 transition-all flex p-5 shadow-md rounded-md flex-col items-center justify-center border">
//                   <Image src={"/pdf.png"} alt="file" width={50} height={50} />
//                   <h2 className="mt-3 font-medium text-lg">
//                     {room.metadata?.title || "Untitled"}
//                   </h2>
//                 </div>
//               </Link>
//             ))
//           ) : (
//             <p className="text-gray-500">No shared documents</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
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
