import { apiFetchJson } from "../lib/apiClient";
import type { ChatMessage, CreateRoomPayload, StudyRoom } from "../types/room.types";

const sortRooms = (rooms: StudyRoom[]) => {
  return rooms.sort((left, right) => (right.createdAt ?? "").localeCompare(left.createdAt ?? ""));
};

export const createRoom = async (payload: CreateRoomPayload): Promise<StudyRoom> => {
  return apiFetchJson<StudyRoom>("/api/rooms", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      subject: payload.subject,
      description: payload.description,
      maxParticipants: payload.maxParticipants,
    }),
  });
};

export const getRoomById = async (roomId: string): Promise<StudyRoom | null> => {
  try {
    return await apiFetchJson<StudyRoom>(`/api/rooms/${encodeURIComponent(roomId)}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Sala no encontrada")) {
      return null;
    }

    throw error;
  }
};

export const listRoomsByOwner = async (ownerId: string): Promise<StudyRoom[]> => {
  const rooms = await listRoomsByParticipant(ownerId);
  return rooms.filter((room) => room.ownerId === ownerId);
};

export const listRoomsByParticipant = async (_uid: string): Promise<StudyRoom[]> => {
  void _uid;
  const rooms = await apiFetchJson<StudyRoom[]>("/api/rooms");
  return sortRooms(rooms);
};

export const findRoomByIdOrCode = async (roomIdOrCode: string): Promise<StudyRoom | null> => {
  const normalizedValue = roomIdOrCode.trim();

  if (!normalizedValue) {
    return null;
  }

  return getRoomById(normalizedValue);
};

export const joinRoom = async (roomIdOrCode: string, _uid: string): Promise<StudyRoom> => {
  void _uid;
  const normalizedValue = roomIdOrCode.trim();

  if (!normalizedValue) {
    throw new Error("Ingresa el ID o codigo de la sala.");
  }

  return apiFetchJson<StudyRoom>(`/api/rooms/${encodeURIComponent(normalizedValue)}/join`, {
    method: "POST",
  });
};

export const updateRoom = async (roomId: string, payload: CreateRoomPayload): Promise<StudyRoom> => {
  return apiFetchJson<StudyRoom>(`/api/rooms/${encodeURIComponent(roomId)}`, {
    method: "PUT",
    body: JSON.stringify({
      name: payload.name,
      subject: payload.subject,
      description: payload.description,
      maxParticipants: payload.maxParticipants,
    }),
  });
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  await apiFetchJson<{ ok: boolean }>(`/api/rooms/${encodeURIComponent(roomId)}`, {
    method: "DELETE",
  });
};

export const listRoomMessages = async (roomId: string): Promise<ChatMessage[]> => {
  return apiFetchJson<ChatMessage[]>(`/api/rooms/${encodeURIComponent(roomId)}/messages`);
};
