export type RoomStatus = "active" | "scheduled" | "closed";
export type ParticipantRole = "owner" | "member";

export type StudyRoom = {
  id: string;
  roomCode: string;
  ownerId: string;
  name: string;
  subject: string;
  description: string;
  status: RoomStatus;
  maxParticipants: number;
  participantIds: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateRoomPayload = {
  ownerId: string;
  name: string;
  subject: string;
  description: string;
  maxParticipants: number;
};

export type RoomParticipant = {
  uid: string;
  role: ParticipantRole;
  joinedAt?: string;
};
