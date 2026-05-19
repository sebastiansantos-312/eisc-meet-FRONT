export type RoomStatus = "active" | "scheduled";

export type StudyRoom = {
  id: string;
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
