"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { liveblocks } from "@/lib/liveblocks";
import { getAccessType, parseStringify } from "@/lib/utils";

// Create new document
export const createDocument = async ({ userId, email, fileName, roomId }) => {
//console.log("room action", { userId, email, fileName, roomId });

  try {
    const metadata = {
      creatorId: userId,
      email,
      title: fileName ?? "Untitled Document",
    };

    const usersAccesses = {
      [email]: ["room:write"],
    };

    // https://liveblocks.io/docs/api-reference/liveblocks-node#post-rooms
    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: [], // [] means private room
    });
    //console.log("created room:", room);

    revalidatePath("/");
    return parseStringify(room);
  } catch (error) {
    console.error("An error occurred while creating a room:", error);
  }
};

// Get one document
export const getDocument = async ({ roomId, userId }) => {
  try {
   // console.log("roomId (fileId):", roomId);
   // console.log("userId (email):", userId);

    // https://liveblocks.io/docs/api-reference/liveblocks-node#get-rooms-roomId
    const room = await liveblocks.getRoom(roomId);
  //  console.log("get room:", room);

    const hasAccess = Object.keys(room.usersAccesses).includes(userId);
   // console.log("hasAccess: ", hasAccess);
    if (!hasAccess) {
      throw new Error("You do not have access to this document.");
    }

    return parseStringify(room);
  } catch (error) {
    console.error("An error occurred while retrieving a room:", error);
  }
};

// Get multiple documents filtered by users accesses
export const getDocuments = async (email) => {
  try {
    // https://liveblocks.io/docs/api-reference/liveblocks-node#get-rooms
    const rooms = await liveblocks.getRooms({ userId: email });

    return parseStringify(rooms);
  } catch (error) {
    console.error("An error occurred while retrieving rooms:", error);
  }
};

// Update document title
export const updateDocument = async (roomId, title) => {
  try {
    // https://liveblocks.io/docs/api-reference/liveblocks-node#post-rooms-roomId
    const room = await liveblocks.updateRoom(roomId, {
      metadata: {
        title,
      },
    });

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.error(
      "An error occurred while updating the document title:",
      error
    );
  }
};

// Delete one document
export const deleteDocument = async (roomId) => {
  try {
    // https://liveblocks.io/docs/api-reference/liveblocks-node#delete-rooms-roomId
    await liveblocks.deleteRoom(roomId);
  } catch (error) {
    console.error("An error occurred while deleting a room:", error);
  } finally {
    revalidatePath("/");
    redirect("/");
  }
};

// Share document access - Edit (['room:write']) or Read (['room:read', 'room:presence:write'])
export const updateDocumentAccess = async ({
  roomId,
  email,
  userType,
  updatedBy,
}) => {
  try {
    const usersAccesses = {
      [email]: getAccessType(userType),
    };

    // https://liveblocks.io/docs/authentication/id-token#permission-types
    const room = await liveblocks.updateRoom(roomId, {
      usersAccesses,
    });

    if (room) {
      const notificationId = nanoid();

      // https://liveblocks.io/docs/api-reference/liveblocks-node#post-inbox-notifications-trigger
      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: "$documentAccess",
        subjectId: notificationId,
        activityData: {
          userType,
          title: `${updatedBy.name} shared a document with you.`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email,
        },
        roomId,
      });
    }

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.error("An error occurred while sharing the document:", error);
  }
};

export const removeCollaborator = async ({ roomId, email }) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    if (room.metadata.email === email) {
      throw new Error(
        "You cannot remove the creator from the collaborators list."
      );
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: { [email]: null },
    });

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updatedRoom);
  } catch (error) {
    console.error("An error occurred while sharing the document:", error);
  }
};


export const getSharedRooms = async (email) => {
  try {
    const result = await liveblocks.getRooms({ userId: email });

    // Debug log
    console.log("liveblocks.getRooms result:", result);

    const rooms = Array.isArray(result) ? result : result?.data || [];

    if (!Array.isArray(rooms)) {
      console.error("Expected array but got:", typeof rooms, rooms);
      return [];
    }

    const filtered = rooms.filter(
      (room) =>
        Object.keys(room.usersAccesses).includes(email) &&
        room.metadata.email !== email
    );

    return parseStringify(filtered);
  } catch (err) {
    console.error("Failed to fetch shared rooms:", err);
    return [];
  }
};

