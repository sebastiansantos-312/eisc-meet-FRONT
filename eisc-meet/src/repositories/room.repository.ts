import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase/firebase.config";
import type { CreateRoomPayload, StudyRoom } from "../types/room.types";

const roomsCollection = "rooms";

const toIsoDate = (value: unknown) => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "toDate" in value) {
    return (value as Timestamp).toDate().toISOString();
  }

  return undefined;
};

const mapRoom = (snapshot: QueryDocumentSnapshot<DocumentData> | { id: string; data: () => DocumentData }): StudyRoom => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ownerId: String(data.ownerId ?? ""),
    name: String(data.name ?? ""),
    subject: String(data.subject ?? ""),
    description: String(data.description ?? ""),
    status: data.status === "scheduled" ? "scheduled" : "active",
    maxParticipants: Number(data.maxParticipants ?? 8),
    participantIds: Array.isArray(data.participantIds) ? data.participantIds.map(String) : [],
    createdAt: toIsoDate(data.createdAt),
    updatedAt: toIsoDate(data.updatedAt),
  };
};

export const createRoom = async (payload: CreateRoomPayload): Promise<StudyRoom> => {
  const name = payload.name.trim();
  const subject = payload.subject.trim();
  const description = payload.description.trim();

  if (!name || !subject) {
    throw new Error("La sala necesita nombre y materia.");
  }

  const maxParticipants = Math.min(Math.max(Number(payload.maxParticipants) || 8, 2), 50);

  const roomRef = await addDoc(collection(db, roomsCollection), {
    ownerId: payload.ownerId,
    name,
    subject,
    description,
    status: "active",
    maxParticipants,
    participantIds: [payload.ownerId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(roomRef);
  return mapRoom({ id: roomRef.id, data: () => snapshot.data() ?? {} });
};

export const getRoomById = async (roomId: string): Promise<StudyRoom | null> => {
  const snapshot = await getDoc(doc(db, roomsCollection, roomId));

  if (!snapshot.exists()) {
    return null;
  }

  return mapRoom({ id: snapshot.id, data: () => snapshot.data() });
};

export const listRoomsByOwner = async (ownerId: string): Promise<StudyRoom[]> => {
  const roomsQuery = query(
    collection(db, roomsCollection),
    where("ownerId", "==", ownerId),
  );
  const snapshot = await getDocs(roomsQuery);

  return snapshot.docs
    .map(mapRoom)
    .sort((left, right) => (right.createdAt ?? "").localeCompare(left.createdAt ?? ""));
};
