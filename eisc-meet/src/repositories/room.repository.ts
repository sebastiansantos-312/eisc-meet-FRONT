import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase/firebase.config";
import type { CreateRoomPayload, StudyRoom } from "../types/room.types";

const roomsCollection = "rooms";
const participantsCollection = "participants";

const buildRoomCode = (roomId: string) => roomId.slice(0, 8).toUpperCase();

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
    roomCode: String(data.roomCode ?? buildRoomCode(snapshot.id)),
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
    roomCode: "",
    name,
    subject,
    description,
    status: "active",
    maxParticipants,
    participantIds: [payload.ownerId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const roomCode = buildRoomCode(roomRef.id);

  await runTransaction(db, async (transaction) => {
    transaction.update(roomRef, {
      roomCode,
      updatedAt: serverTimestamp(),
    });
    transaction.set(doc(roomRef, participantsCollection, payload.ownerId), {
      uid: payload.ownerId,
      role: "owner",
      joinedAt: serverTimestamp(),
    });
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

export const listRoomsByParticipant = async (uid: string): Promise<StudyRoom[]> => {
  const roomsQuery = query(
    collection(db, roomsCollection),
    where("participantIds", "array-contains", uid),
  );
  const snapshot = await getDocs(roomsQuery);

  return snapshot.docs
    .map(mapRoom)
    .sort((left, right) => (right.createdAt ?? "").localeCompare(left.createdAt ?? ""));
};

export const findRoomByIdOrCode = async (roomIdOrCode: string): Promise<StudyRoom | null> => {
  const normalizedValue = roomIdOrCode.trim();

  if (!normalizedValue) {
    return null;
  }

  const roomById = await getRoomById(normalizedValue);

  if (roomById) {
    return roomById;
  }

  const roomByCodeQuery = query(
    collection(db, roomsCollection),
    where("roomCode", "==", normalizedValue.toUpperCase()),
  );
  const snapshot = await getDocs(roomByCodeQuery);
  const firstRoom = snapshot.docs[0];

  return firstRoom ? mapRoom(firstRoom) : null;
};

export const joinRoom = async (roomIdOrCode: string, uid: string): Promise<StudyRoom> => {
  const room = await findRoomByIdOrCode(roomIdOrCode);

  if (!room) {
    throw new Error("No se encontro una sala con ese ID o codigo.");
  }

  if (room.participantIds.includes(uid)) {
    return room;
  }

  if (room.participantIds.length >= room.maxParticipants) {
    throw new Error("La sala ya alcanzo el maximo de participantes.");
  }

  const roomRef = doc(db, roomsCollection, room.id);
  const participantRef = doc(roomRef, participantsCollection, uid);

  await runTransaction(db, async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);

    if (!roomSnapshot.exists()) {
      throw new Error("La sala ya no existe.");
    }

    const currentRoom = mapRoom({ id: roomSnapshot.id, data: () => roomSnapshot.data() });

    if (currentRoom.participantIds.includes(uid)) {
      return;
    }

    if (currentRoom.participantIds.length >= currentRoom.maxParticipants) {
      throw new Error("La sala ya alcanzo el maximo de participantes.");
    }

    transaction.update(roomRef, {
      participantIds: arrayUnion(uid),
      updatedAt: serverTimestamp(),
    });
    transaction.set(participantRef, {
      uid,
      role: "member",
      joinedAt: serverTimestamp(),
    });
  });

  const joinedRoom = await getRoomById(room.id);

  if (!joinedRoom) {
    throw new Error("No se pudo cargar la sala despues de unirte.");
  }

  return joinedRoom;
};
