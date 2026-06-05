import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  MoreVertical,
  PhoneOff,
  Send,
  Settings,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { getRoomById, listRoomMessages } from "../../repositories/room.repository";
import { connectSocket, socket } from "../../sockets/socketManager";
import useAuthStore from "../../stores/useAuthStore";
import type { ChatMessage, StudyRoom } from "../../types/room.types";

type OnlineRoomUser = {
  socketId: string;
  userId: string;
  displayName?: string;
  avatar?: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
};

type VideoParticipant = {
  id: string;
  socketId?: string;
  name: string;
  avatar: string;
  stream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  isOnline: boolean;
  isLocal: boolean;
};

type RoomNotice = {
  id: number;
  message: string;
};

type WebRtcOfferPayload = {
  roomId: string;
  fromSocketId: string;
  fromUserId: string;
  offer: RTCSessionDescriptionInit;
};

type WebRtcAnswerPayload = {
  roomId: string;
  fromSocketId: string;
  answer: RTCSessionDescriptionInit;
};

type WebRtcCandidatePayload = {
  roomId: string;
  fromSocketId: string;
  candidate: RTCIceCandidateInit;
};

type MediaStatePayload = {
  roomId: string;
  fromSocketId: string;
  fromUserId: string;
  isMuted: boolean;
  isVideoOff: boolean;
};

type DeviceKind = "audioinput" | "videoinput";

const peerConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.authUser);
  const profile = useAuthStore((state) => state.profile);
  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineRoomUser[]>([]);
  const [remoteMediaStates, setRemoteMediaStates] = useState<Record<string, { isMuted: boolean; isVideoOff: boolean }>>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState("");
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState("");
  const [openDeviceMenu, setOpenDeviceMenu] = useState<DeviceKind | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [roomNotices, setRoomNotices] = useState<RoomNotice[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraTrackBeforeScreenRef = useRef<MediaStreamTrack | null>(null);
  const videoOffBeforeScreenRef = useRef(true);
  const selectedAudioDeviceIdRef = useRef("");
  const selectedVideoDeviceIdRef = useRef("");
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const pendingCandidatesRef = useRef<Record<string, RTCIceCandidateInit[]>>({});
  const previousOnlineUsersRef = useRef<OnlineRoomUser[]>([]);
  const roomUsersInitializedRef = useRef(false);

  const hasAudioTrack = Boolean(localStream?.getAudioTracks().length);
  const hasVideoTrack = Boolean(localStream?.getVideoTracks().length);
  const canUseMicrophone = hasAudioTrack && !isMuted;
  const canUseCamera = hasVideoTrack && !isVideoOff;
  const localDisplayName = getDisplayName({
    name: profile?.name ?? authUser?.displayName,
    username: profile?.username,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    fallback: authUser?.email ?? "Tu",
  });
  const localAvatar = getInitials(localDisplayName);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;

    const devices = await navigator.mediaDevices.enumerateDevices();
    const nextAudioDevices = devices.filter((device) => device.kind === "audioinput");
    const nextVideoDevices = devices.filter((device) => device.kind === "videoinput");

    setAudioDevices(nextAudioDevices);
    setVideoDevices(nextVideoDevices);
    setSelectedAudioDeviceId((current) => current || nextAudioDevices[0]?.deviceId || "");
    setSelectedVideoDeviceId((current) => current || nextVideoDevices[0]?.deviceId || "");
  }, []);

  const applyStreamToPeers = useCallback((stream: MediaStream) => {
    Object.values(peerConnectionsRef.current).forEach((connection) => {
      syncLocalTracksToConnection(connection, stream);
    });
  }, []);

  const requestLocalMedia = useCallback(async (options?: { audioDeviceId?: string; videoDeviceId?: string; enableAudio?: boolean; enableVideo?: boolean }) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError("Tu navegador no permite usar camara y microfono en esta pagina.");
      setIsVideoOff(true);
      setIsMuted(true);
      return null;
    }

    setMediaLoading(true);
    const enableAudio = options?.enableAudio ?? true;
    const enableVideo = options?.enableVideo ?? true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: enableAudio ? mediaConstraintForDevice(options?.audioDeviceId || selectedAudioDeviceIdRef.current) : false,
        video: enableVideo ? mediaConstraintForDevice(options?.videoDeviceId || selectedVideoDeviceIdRef.current) : false,
      });

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = stream;
      applyStreamToPeers(stream);
      setLocalStream(stream);
      setIsMuted(!enableAudio);
      setIsVideoOff(!enableVideo);
      setMediaError(null);
      await refreshDevices();
      return stream;
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      const message = name === "NotAllowedError" || name === "PermissionDeniedError"
        ? "El navegador bloqueo la camara o el microfono. Revisa el candado de la barra de direccion y permite los dispositivos."
        : "No se pudo iniciar camara o microfono. Revisa que otro programa no los este usando.";

      setMediaError(message);
      setIsVideoOff(true);
      setIsMuted(true);
      return null;
    } finally {
      setMediaLoading(false);
    }
  }, [applyStreamToPeers, refreshDevices]);

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;

    const audioTracks = localStreamRef.current?.getAudioTracks() ?? [];
    const cameraTrack = cameraTrackBeforeScreenRef.current;
    const shouldRestoreCamera = Boolean(cameraTrack && cameraTrack.readyState !== "ended" && !videoOffBeforeScreenRef.current);
    const nextStream = new MediaStream([
      ...audioTracks,
      ...(shouldRestoreCamera && cameraTrack ? [cameraTrack] : []),
    ]);

    cameraTrackBeforeScreenRef.current = null;
    replaceVideoTrackInConnections(peerConnectionsRef.current, shouldRestoreCamera ? cameraTrack : null, nextStream);
    localStreamRef.current = nextStream.getTracks().length ? nextStream : null;
    setLocalStream(localStreamRef.current);
    setIsScreenSharing(false);
    setIsVideoOff(!shouldRestoreCamera);
  }, []);

  const startScreenShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setMediaError("Tu navegador no permite compartir pantalla en esta pagina.");
      return;
    }

    setMediaLoading(true);

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const screenTrack = screenStream.getVideoTracks()[0];

      if (!screenTrack) {
        screenStream.getTracks().forEach((track) => track.stop());
        setMediaError("No se pudo obtener el video de la pantalla.");
        return;
      }

      cameraTrackBeforeScreenRef.current = localStreamRef.current?.getVideoTracks()[0] ?? null;
      videoOffBeforeScreenRef.current = isVideoOff;
      screenStreamRef.current = screenStream;

      const audioTracks = localStreamRef.current?.getAudioTracks() ?? [];
      const nextStream = new MediaStream([...audioTracks, screenTrack]);

      replaceVideoTrackInConnections(peerConnectionsRef.current, screenTrack, nextStream);
      localStreamRef.current = nextStream;
      setLocalStream(nextStream);
      setIsScreenSharing(true);
      setIsVideoOff(false);
      setMediaError(null);

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      const message = name === "NotAllowedError" || name === "PermissionDeniedError"
        ? "El navegador bloqueo la captura de pantalla."
        : "No se pudo iniciar la comparticion de pantalla.";

      setMediaError(message);
    } finally {
      setMediaLoading(false);
    }
  }, [isVideoOff, stopScreenShare]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }

    await startScreenShare();
  }, [isScreenSharing, startScreenShare, stopScreenShare]);

  const addRoomNotice = useCallback((message: string) => {
    const id = Date.now() + Math.random();

    setRoomNotices((current) => [...current, { id, message }].slice(-3));
    window.setTimeout(() => {
      setRoomNotices((current) => current.filter((notice) => notice.id !== id));
    }, 4000);
  }, []);

  const participants = useMemo(() => {
    const knownIds = new Set<string>();
    onlineUsers.forEach((user) => knownIds.add(user.userId));

    if (authUser?.uid) knownIds.add(authUser.uid);

    return [...knownIds].map<VideoParticipant>((uid) => {
      const userSockets = onlineUsers.filter((user) => user.userId === uid);
      const onlineUser = userSockets.find((user) => remoteStreams[user.socketId]) ?? userSockets[0];
      const isLocal = uid === authUser?.uid;
      const stream = isLocal ? localStream : onlineUser?.socketId ? remoteStreams[onlineUser.socketId] ?? null : null;
      const remoteMediaState = onlineUser?.socketId ? remoteMediaStates[onlineUser.socketId] : undefined;
      const displayName = isLocal ? "Tu" : onlineUser?.displayName ?? "Participante";
      const avatar = isLocal ? localAvatar : onlineUser?.avatar ?? getInitials(displayName);

      return {
        id: uid,
        socketId: onlineUser?.socketId,
        name: displayName,
        avatar,
        stream,
        isMuted: isLocal ? isMuted : remoteMediaState?.isMuted ?? onlineUser?.isMuted ?? !stream?.getAudioTracks().some((track) => track.enabled),
        isVideoOff: isLocal ? isVideoOff : remoteMediaState?.isVideoOff ?? onlineUser?.isVideoOff ?? !stream?.getVideoTracks().some((track) => track.enabled),
        isSpeaking: isLocal && !isMuted,
        isOnline: onlineUsers.some((user) => user.userId === uid) || isLocal,
        isLocal,
      };
    });
  }, [authUser?.uid, isMuted, isVideoOff, localAvatar, localStream, onlineUsers, remoteMediaStates, remoteStreams]);

  const participantNames = useMemo(() => {
    const names: Record<string, string> = {};
    if (authUser?.uid) names[authUser.uid] = "Tu";

    onlineUsers.forEach((user) => {
      names[user.userId] = user.userId === authUser?.uid ? "Tu" : user.displayName ?? "Participante";
    });

    return names;
  }, [authUser?.uid, onlineUsers]);

  useEffect(() => {
    let active = true;

    const loadRoom = async () => {
      if (!roomId) {
        setRoomLoading(false);
        setRoomError("No se encontro el ID de la sala.");
        return;
      }

      setRoomLoading(true);
      setRoomError(null);

      try {
        const nextRoom = await getRoomById(roomId);

        if (!active) return;

        if (!nextRoom) {
          setRoomError("Esta sala no existe o no tienes acceso.");
          setRoom(null);
          return;
        }

        if (nextRoom.status === "closed") {
          navigate("/dashboard", { replace: true, state: { notice: "La sala fue cerrada por el anfitrion." } });
          return;
        }

        setRoom(nextRoom);
        const history = await listRoomMessages(nextRoom.id);
        if (active) setMessages(history);
      } catch {
        if (active) setRoomError("No se pudo cargar la sala.");
      } finally {
        if (active) setRoomLoading(false);
      }
    };

    loadRoom();

    return () => {
      active = false;
    };
  }, [navigate, roomId]);

  useEffect(() => {
    if (!roomId || !authUser?.uid) return;
    const currentUserId = authUser.uid;

    connectSocket().then((connected) => {
      if (connected) socket.emit("room:join", { roomId, displayName: localDisplayName, avatar: localAvatar });
    });

    const handleRoomUsers = (payload: { roomId: string; users: OnlineRoomUser[] }) => {
      if (payload.roomId === roomId) {
        const previousUsers = previousOnlineUsersRef.current;
        const nextUsers = payload.users;

        if (roomUsersInitializedRef.current) {
          nextUsers
            .filter((user) => user.userId !== currentUserId)
            .filter((user) => !previousUsers.some((previousUser) => previousUser.socketId === user.socketId))
            .forEach((user) => addRoomNotice(`${getPresenceName(user)} se unio a la sala`));

          previousUsers
            .filter((user) => user.userId !== currentUserId)
            .filter((user) => !nextUsers.some((nextUser) => nextUser.socketId === user.socketId))
            .forEach((user) => addRoomNotice(`${getPresenceName(user)} salio de la sala`));
        } else {
          roomUsersInitializedRef.current = true;
        }

        previousOnlineUsersRef.current = nextUsers;
        setRemoteMediaStates((current) => {
          const next = { ...current };

          nextUsers.forEach((user) => {
            if (typeof user.isMuted === "boolean" || typeof user.isVideoOff === "boolean") {
              next[user.socketId] = {
                isMuted: Boolean(user.isMuted),
                isVideoOff: Boolean(user.isVideoOff),
              };
            }
          });

          Object.keys(next).forEach((socketId) => {
            if (!nextUsers.some((user) => user.socketId === socketId)) delete next[socketId];
          });

          return next;
        });
        setOnlineUsers(payload.users);
      }
    };

    const handleChatMessage = (message: ChatMessage) => {
      if (message.roomId !== roomId) return;

      setMessages((current) => {
        if (current.some((entry) => entry.id === message.id)) return current;
        return [...current, message];
      });
      setSendingMessage(false);
      setChatError(null);
    };

    const handleChatError = (payload: { message?: string }) => {
      setSendingMessage(false);
      setChatError(payload.message ?? "No se pudo enviar el mensaje.");
    };

    const handleRoomClosed = (payload: { roomId: string }) => {
      if (payload.roomId !== roomId) return;

      socket.emit("room:leave", { roomId });
      navigate("/dashboard", { replace: true, state: { notice: "La sala fue cerrada por el anfitrion." } });
    };

    const handleMediaState = (payload: MediaStatePayload) => {
      if (payload.roomId !== roomId) return;

      setRemoteMediaStates((current) => ({
        ...current,
        [payload.fromSocketId]: {
          isMuted: payload.isMuted,
          isVideoOff: payload.isVideoOff,
        },
      }));
    };

    socket.on("room:users", handleRoomUsers);
    socket.on("chat:message", handleChatMessage);
    socket.on("chat:error", handleChatError);
    socket.on("room:closed", handleRoomClosed);
    socket.on("room:media-state", handleMediaState);

    return () => {
      socket.emit("room:leave", { roomId });
      previousOnlineUsersRef.current = [];
      roomUsersInitializedRef.current = false;
      socket.off("room:users", handleRoomUsers);
      socket.off("chat:message", handleChatMessage);
      socket.off("chat:error", handleChatError);
      socket.off("room:closed", handleRoomClosed);
      socket.off("room:media-state", handleMediaState);
    };
  }, [addRoomNotice, authUser?.uid, localAvatar, localDisplayName, navigate, roomId]);

  useEffect(() => {
    if (!roomId || !authUser?.uid || !socket.connected) return;

    socket.emit("room:media-state", { roomId, isMuted, isVideoOff });
  }, [authUser?.uid, isMuted, isVideoOff, roomId]);

  useEffect(() => {
    refreshDevices().catch(() => undefined);

    return () => {
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      Object.values(peerConnectionsRef.current).forEach((connection) => connection.close());
      peerConnectionsRef.current = {};
      pendingCandidatesRef.current = {};
    };
  }, [refreshDevices]);

  useEffect(() => {
    if (!navigator.mediaDevices?.addEventListener) return;

    const handleDeviceChange = () => {
      refreshDevices().catch(() => undefined);
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
  }, [refreshDevices]);

  useEffect(() => {
    if (!showSettings && !showMoreMenu) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setShowSettings(false);
      setShowMoreMenu(false);
      setOpenDeviceMenu(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showMoreMenu, showSettings]);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    selectedAudioDeviceIdRef.current = selectedAudioDeviceId;
  }, [selectedAudioDeviceId]);

  useEffect(() => {
    selectedVideoDeviceIdRef.current = selectedVideoDeviceId;
  }, [selectedVideoDeviceId]);

  useEffect(() => {
    if (!roomId || !authUser?.uid) return;

    const createPeerConnection = (targetSocketId: string) => {
      const existingConnection = peerConnectionsRef.current[targetSocketId];

      if (existingConnection) return existingConnection;

      const connection = new RTCPeerConnection(peerConfig);
      peerConnectionsRef.current[targetSocketId] = connection;

      ensureReceiveTransceivers(connection);
      if (localStreamRef.current) syncLocalTracksToConnection(connection, localStreamRef.current);

      connection.onicecandidate = (event) => {
        if (!event.candidate) return;
        socket.emit("webrtc:ice-candidate", {
          roomId,
          targetSocketId,
          candidate: event.candidate.toJSON(),
        });
      };

      connection.ontrack = (event) => {
        setRemoteStreams((current) => ({
          ...current,
          [targetSocketId]: mergeRemoteTrack(current[targetSocketId], event),
        }));
      };

      connection.onconnectionstatechange = () => {
        if (["closed", "disconnected", "failed"].includes(connection.connectionState)) {
          setRemoteStreams((current) => {
            const next = { ...current };
            delete next[targetSocketId];
            return next;
          });
        }
      };

      connection.onnegotiationneeded = () => {
        if (connection.signalingState !== "stable") return;

        callPeer(targetSocketId).catch(() => {
          setMediaError("No se pudo actualizar la conexion de audio y video.");
        });
      };

      return connection;
    };

    const flushPendingCandidates = async (targetSocketId: string) => {
      const connection = peerConnectionsRef.current[targetSocketId];
      const candidates = pendingCandidatesRef.current[targetSocketId] ?? [];

      if (!connection?.remoteDescription) return;

      for (const candidate of candidates) {
        await connection.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => undefined);
      }

      delete pendingCandidatesRef.current[targetSocketId];
    };

    const callPeer = async (targetSocketId: string) => {
      const connection = createPeerConnection(targetSocketId);
      if (connection.signalingState !== "stable") return;

      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      socket.emit("webrtc:offer", { roomId, targetSocketId, offer });
    };

    const handleRoomUsersForWebRtc = (payload: { roomId: string; users: OnlineRoomUser[] }) => {
      if (payload.roomId !== roomId) return;

      payload.users
        .filter((user) => user.socketId !== socket.id)
        .filter((user) => !peerConnectionsRef.current[user.socketId])
        .forEach((user) => {
          if (socket.id && socket.id < user.socketId) {
            callPeer(user.socketId).catch(() => setMediaError("No se pudo iniciar la conexion de video con otro participante."));
          }
        });
    };

    const handleOffer = async (payload: WebRtcOfferPayload) => {
      if (payload.roomId !== roomId) return;

      const connection = createPeerConnection(payload.fromSocketId);
      await connection.setRemoteDescription(new RTCSessionDescription(payload.offer));
      await flushPendingCandidates(payload.fromSocketId);
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      socket.emit("webrtc:answer", { roomId, targetSocketId: payload.fromSocketId, answer });
    };

    const handleAnswer = async (payload: WebRtcAnswerPayload) => {
      if (payload.roomId !== roomId) return;

      const connection = peerConnectionsRef.current[payload.fromSocketId];
      if (!connection) return;

      await connection.setRemoteDescription(new RTCSessionDescription(payload.answer));
      await flushPendingCandidates(payload.fromSocketId);
    };

    const handleIceCandidate = async (payload: WebRtcCandidatePayload) => {
      if (payload.roomId !== roomId) return;

      const connection = peerConnectionsRef.current[payload.fromSocketId];

      if (!connection?.remoteDescription) {
        pendingCandidatesRef.current[payload.fromSocketId] = [
          ...(pendingCandidatesRef.current[payload.fromSocketId] ?? []),
          payload.candidate,
        ];
        return;
      }

      await connection.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => undefined);
    };

    const handlePeerLeft = (payload: { roomId: string; socketId: string }) => {
      if (payload.roomId !== roomId) return;

      peerConnectionsRef.current[payload.socketId]?.close();
      delete peerConnectionsRef.current[payload.socketId];
      delete pendingCandidatesRef.current[payload.socketId];
      setRemoteStreams((current) => {
        const next = { ...current };
        delete next[payload.socketId];
        return next;
      });
    };

    socket.on("room:users", handleRoomUsersForWebRtc);
    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice-candidate", handleIceCandidate);
    socket.on("webrtc:peer-left", handlePeerLeft);

    return () => {
      socket.off("room:users", handleRoomUsersForWebRtc);
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:answer", handleAnswer);
      socket.off("webrtc:ice-candidate", handleIceCandidate);
      socket.off("webrtc:peer-left", handlePeerLeft);
    };
  }, [authUser?.uid, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, showChat]);

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!roomId || !trimmedMessage) return;

    setSendingMessage(true);
    setChatError(null);
    socket.emit("chat:message", { roomId, message: trimmedMessage });
    setMessageText("");
  };

  const toggleMicrophone = async () => {
    if (!hasAudioTrack) {
      if (isScreenSharing) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: mediaConstraintForDevice(selectedAudioDeviceIdRef.current),
            video: false,
          });
          const audioTrack = audioStream.getAudioTracks()[0];
          const currentVideoTrack = localStreamRef.current?.getVideoTracks()[0];
          const nextStream = new MediaStream([
            ...(audioTrack ? [audioTrack] : []),
            ...(currentVideoTrack ? [currentVideoTrack] : []),
          ]);

          localStreamRef.current = nextStream;
          setLocalStream(nextStream);
          applyStreamToPeers(nextStream);
          setIsMuted(false);
          setMediaError(null);
        } catch {
          setMediaError("No se pudo activar el microfono durante la comparticion de pantalla.");
        }
        return;
      }

      await requestLocalMedia({ enableAudio: true, enableVideo: hasVideoTrack && !isVideoOff });
      return;
    }

    setIsMuted((current) => {
      const nextMuted = !current;
      localStreamRef.current?.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
      return nextMuted;
    });
  };

  const toggleCamera = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }

    if (!hasVideoTrack) {
      await requestLocalMedia({ enableAudio: hasAudioTrack && !isMuted, enableVideo: true });
      return;
    }

    setIsVideoOff((current) => {
      const nextVideoOff = !current;
      localStreamRef.current?.getVideoTracks().forEach((track) => {
        track.enabled = !nextVideoOff;
      });
      return nextVideoOff;
    });
  };

  const handleSelectAudioDevice = async (deviceId: string) => {
    setSelectedAudioDeviceId(deviceId);
    setOpenDeviceMenu(null);
    if (hasAudioTrack) await requestLocalMedia({ audioDeviceId: deviceId, enableAudio: !isMuted, enableVideo: hasVideoTrack && !isVideoOff });
  };

  const handleSelectVideoDevice = async (deviceId: string) => {
    setSelectedVideoDeviceId(deviceId);
    setOpenDeviceMenu(null);
    if (hasVideoTrack && !isScreenSharing) await requestLocalMedia({ videoDeviceId: deviceId, enableAudio: hasAudioTrack && !isMuted, enableVideo: !isVideoOff });
  };

  const handleRetryMedia = async () => {
    await requestLocalMedia({ enableAudio: !isMuted, enableVideo: !isVideoOff });
  };

  const handleCopyRoomId = () => {
    if (!roomId) return;
    navigator.clipboard?.writeText(roomId).catch(() => undefined);
    setShowMoreMenu(false);
  };

  const leaveRoom = useCallback(() => {
    if (roomId) socket.emit("room:leave", { roomId });
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    Object.values(peerConnectionsRef.current).forEach((connection) => connection.close());
    peerConnectionsRef.current = {};
    pendingCandidatesRef.current = {};
    setRemoteStreams({});
    navigate("/dashboard");
  }, [navigate, roomId]);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground" aria-label="Sala de estudio colaborativo">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-card/95 px-3 py-2.5 shadow-sm sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={leaveRoom}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Volver al inicio"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-card-foreground sm:text-lg">
              {roomLoading ? "Cargando sala..." : room?.name ?? "Sala de estudio"}
            </h1>
            <p className="truncate text-xs text-muted-foreground">ID de sala: {roomId ?? "general"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-card-foreground sm:flex" aria-live="polite">
            <Users className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>{participants.length}</span>
            <span className="text-muted-foreground">participantes</span>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Configuracion de dispositivos"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu((current) => !current)}
              className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Mas opciones"
              aria-haspopup="menu"
              aria-expanded={showMoreMenu}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showMoreMenu ? (
              <div className="absolute right-0 top-11 z-20 w-56 rounded-lg border border-border bg-card p-2 shadow-xl" role="menu">
                <button type="button" onClick={handleCopyRoomId} className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary" role="menuitem">
                  Copiar ID de sala
                </button>
                <button type="button" onClick={() => { setShowChat((current) => !current); setShowMoreMenu(false); }} className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary" role="menuitem">
                  {showChat ? "Ocultar chat" : "Mostrar chat"}
                </button>
                <button type="button" onClick={() => { handleRetryMedia(); setShowMoreMenu(false); }} className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary" role="menuitem">
                  Reintentar camara y microfono
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {roomNotices.length ? (
        <div className="pointer-events-none fixed left-1/2 top-20 z-40 flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4" aria-live="polite">
          {roomNotices.map((notice) => (
            <div key={notice.id} className="rounded-full bg-black/80 px-4 py-2 text-sm font-medium text-white shadow-xl backdrop-blur">
              {notice.message}
            </div>
          ))}
        </div>
      ) : null}

      <section className="flex min-h-0 flex-1 overflow-hidden bg-background" aria-label="Contenido de la sala">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border/80 px-3 py-2 sm:hidden">
            <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm font-medium text-card-foreground" aria-live="polite">
              <Users className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{participants.length} participantes</span>
            </div>
            {!showChat ? (
              <button
                type="button"
                onClick={() => setShowChat(true)}
                className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm font-medium text-card-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Chat
              </button>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
          {roomError ? (
            <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
              {roomError}
            </div>
          ) : null}
          {mediaError ? (
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between" role="alert">
              <span>{mediaError}</span>
              <button
                type="button"
                onClick={handleRetryMedia}
                disabled={mediaLoading}
                className="rounded-lg border border-amber-200/40 px-3 py-2 font-semibold text-amber-50 transition-colors hover:bg-amber-200/10 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mediaLoading ? "Solicitando..." : "Reintentar permisos"}
              </button>
            </div>
          ) : null}
          <div className={`grid min-h-full content-center gap-3 sm:gap-4 ${participants.length <= 1 ? "mx-auto w-full max-w-5xl grid-cols-1" : "grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]"}`} aria-label={`Mosaico de video con ${participants.length} participantes`}>
            {participants.map((participant) => (
              <ParticipantVideo key={participant.id} participant={participant} />
            ))}
          </div>
          </div>
        </div>

        {showChat ? (
          <aside className="hidden w-80 shrink-0 flex-col border-l border-border bg-card md:flex xl:w-96" aria-label="Chat de la sala">
            <ChatPanel
              messages={messages}
              authUserId={authUser?.uid}
              participantNames={participantNames}
              messageText={messageText}
              sending={sendingMessage}
              error={chatError}
              messagesEndRef={messagesEndRef}
              onMessageTextChange={setMessageText}
              onSend={handleSendMessage}
              onClose={() => setShowChat(false)}
            />
          </aside>
        ) : null}
      </section>

      {showChat ? (
        <section className="max-h-[42dvh] border-t border-border bg-card md:hidden" aria-label="Chat de la sala">
          <ChatPanel
            compact
            messages={messages}
            authUserId={authUser?.uid}
            participantNames={participantNames}
            messageText={messageText}
            sending={sendingMessage}
            error={chatError}
            messagesEndRef={messagesEndRef}
            onMessageTextChange={setMessageText}
            onSend={handleSendMessage}
            onClose={() => setShowChat(false)}
          />
        </section>
      ) : null}

      <footer className="relative z-40 border-t border-border bg-card px-3 py-2.5 sm:px-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 overflow-visible">
          <div className="hidden min-w-0 items-center gap-2 text-sm text-muted-foreground lg:flex">
            <Users className="h-5 w-5" aria-hidden="true" />
            <span>{participants.length} participantes</span>
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-2 overflow-visible px-1 sm:flex-nowrap">
            <MediaControlGroup
              kind="audioinput"
              open={openDeviceMenu === "audioinput"}
              devices={audioDevices}
              selectedDeviceId={selectedAudioDeviceId}
              onToggleMenu={() => setOpenDeviceMenu((current) => current === "audioinput" ? null : "audioinput")}
              onSelectDevice={handleSelectAudioDevice}
              control={
                <ControlButton
                  icon={isMuted || !hasAudioTrack ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  label={canUseMicrophone ? "Silenciar" : "Activar microfono"}
                  active={canUseMicrophone}
                  disabled={mediaLoading}
                  onClick={toggleMicrophone}
                />
              }
            />
            <MediaControlGroup
              kind="videoinput"
              open={openDeviceMenu === "videoinput"}
              devices={videoDevices}
              selectedDeviceId={selectedVideoDeviceId}
              onToggleMenu={() => setOpenDeviceMenu((current) => current === "videoinput" ? null : "videoinput")}
              onSelectDevice={handleSelectVideoDevice}
              control={
                <ControlButton
                  icon={isVideoOff || !hasVideoTrack ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                  label={isScreenSharing ? "Pantalla activa" : canUseCamera ? "Apagar camara" : "Activar camara"}
                  active={canUseCamera}
                  disabled={mediaLoading || isScreenSharing}
                  onClick={toggleCamera}
                />
              }
            />
            <ControlButton
              icon={isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
              label={isScreenSharing ? "Dejar de compartir" : "Compartir pantalla"}
              active={isScreenSharing}
              disabled={mediaLoading}
              onClick={toggleScreenShare}
            />
            {!showChat ? (
              <ControlButton icon={<MessageSquare className="h-5 w-5" />} label="Mensajes" onClick={() => setShowChat(true)} />
            ) : null}
            <button
              type="button"
              onClick={leaveRoom}
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-red-400 px-4 font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-300 sm:px-5"
              aria-label="Salir de la sala"
            >
              <PhoneOff className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

          <div className="hidden w-32 lg:block" aria-hidden="true" />
        </div>
      </footer>

      {showSettings ? (
        <DeviceSettingsDialog
          audioDevices={audioDevices}
          videoDevices={videoDevices}
          selectedAudioDeviceId={selectedAudioDeviceId}
          selectedVideoDeviceId={selectedVideoDeviceId}
          mediaError={mediaError}
          mediaLoading={mediaLoading}
          onSelectAudioDevice={handleSelectAudioDevice}
          onSelectVideoDevice={handleSelectVideoDevice}
          onRetry={() => requestLocalMedia({ enableAudio: true, enableVideo: true })}
          onClose={() => setShowSettings(false)}
        />
      ) : null}
    </main>
  );
};

const ParticipantVideo = ({ participant }: { participant: VideoParticipant }) => {
  return (
    <article
      className={`relative flex aspect-video min-h-44 items-center justify-center overflow-hidden rounded-lg border bg-muted shadow-sm transition-colors ${
        participant.isSpeaking ? "border-primary ring-2 ring-primary/40" : "border-border"
      }`}
      aria-label={`${participant.name}${participant.isLocal ? ", participante local" : ""}. ${participant.isMuted ? "Microfono apagado" : "Microfono activo"}. ${participant.isVideoOff ? "Camara apagada" : "Camara activa"}.`}
    >
      {participant.stream && !participant.isVideoOff ? (
        <StreamVideo stream={participant.stream} />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 sm:h-28 sm:w-28" aria-hidden="true">
          <span className="text-3xl font-semibold text-primary sm:text-4xl">{participant.avatar}</span>
        </div>
      )}
      {participant.stream && !participant.isLocal ? <StreamAudio stream={participant.stream} /> : null}

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 rounded-full bg-black/75 px-3 py-1.5 backdrop-blur-sm">
          <span className="truncate text-sm font-semibold text-white">{participant.name}</span>
          {participant.isMuted ? <MicOff className="h-3.5 w-3.5 shrink-0 text-white" aria-label="Microfono apagado" /> : null}
          {participant.isVideoOff ? <VideoOff className="h-3.5 w-3.5 shrink-0 text-white" aria-label="Camara apagada" /> : null}
        </div>
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${participant.isOnline ? "bg-green-400" : "bg-slate-400"}`} aria-label={participant.isOnline ? "En linea" : "Desconectado"} />
      </div>
    </article>
  );
};

const StreamVideo = ({ stream }: { stream: MediaStream }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      aria-label="Video del participante"
      className="h-full w-full bg-black object-cover"
    />
  );
};

const StreamAudio = ({ stream }: { stream: MediaStream }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline aria-label="Audio del participante" />;
};

const ChatPanel = ({
  compact,
  messages,
  authUserId,
  participantNames,
  messageText,
  sending,
  error,
  messagesEndRef,
  onMessageTextChange,
  onSend,
  onClose,
}: {
  compact?: boolean;
  messages: ChatMessage[];
  authUserId?: string;
  participantNames: Record<string, string>;
  messageText: string;
  sending: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onMessageTextChange: (value: string) => void;
  onSend: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) => {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!messages || !messagesContainerRef.current) return;
    const el = messagesContainerRef.current;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } catch {
      // fallback for older browsers
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={`flex min-h-0 flex-col ${compact ? "max-h-[42dvh]" : "h-full"}`}>
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="font-semibold text-card-foreground">Mensajes</h2>
        </div>
        <button onClick={onClose} className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Cerrar chat">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div ref={messagesContainerRef} className="flex-1 space-y-4 overflow-auto p-4" role="log" aria-live="polite" aria-relevant="additions text">
        {messages.length ? (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} isYou={message.senderId === authUserId} senderName={participantNames[message.senderId] ?? "Participante"} />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground" role="status">
            Aun no hay mensajes en esta sala.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-4">
        {error ? (
          <p className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">{error}</p>
        ) : null}
        <form onSubmit={onSend} className="flex gap-2">
          <label className="sr-only" htmlFor="room-chat-message">Mensaje para el chat</label>
          <input
            id="room-chat-message"
            type="text"
            value={messageText}
            onChange={(event) => onMessageTextChange(event.target.value)}
            placeholder="Escribe un mensaje..."
            className="min-w-0 flex-1 rounded-lg border border-input bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="rounded-lg bg-primary p-2 text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Enviar mensaje"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
};

const MediaControlGroup = ({
  kind,
  open,
  devices,
  selectedDeviceId,
  control,
  onToggleMenu,
  onSelectDevice,
}: {
  kind: DeviceKind;
  open: boolean;
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  control: ReactNode;
  onToggleMenu: () => void;
  onSelectDevice: (deviceId: string) => void;
}) => {
  const label = kind === "audioinput" ? "Elegir microfono" : "Elegir camara";
  const emptyLabel = kind === "audioinput" ? "No hay microfonos detectados" : "No hay camaras detectadas";

  return (
    <div className="relative z-50 flex shrink-0 overflow-visible rounded-full">
      {control}
      <button
        type="button"
        onClick={onToggleMenu}
        className="ml-1 flex h-12 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute bottom-14 left-0 z-[80] w-72 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-2xl ring-1 ring-black/10" role="listbox" aria-label={label}>
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase text-muted-foreground">{label}</p>
          {devices.length ? (
            devices.map((device, index) => (
              <button
                key={device.deviceId || `${kind}-${index}`}
                type="button"
                onClick={() => onSelectDevice(device.deviceId)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary ${
                  selectedDeviceId === device.deviceId ? "bg-accent text-accent-foreground" : ""
                }`}
                role="option"
                aria-selected={selectedDeviceId === device.deviceId}
              >
                {device.label || `${kind === "audioinput" ? "Microfono" : "Camara"} ${index + 1}`}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">{emptyLabel}</p>
          )}
        </div>
      ) : null}
    </div>
  );
};

const DeviceSettingsDialog = ({
  audioDevices,
  videoDevices,
  selectedAudioDeviceId,
  selectedVideoDeviceId,
  mediaError,
  mediaLoading,
  onSelectAudioDevice,
  onSelectVideoDevice,
  onRetry,
  onClose,
}: {
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedAudioDeviceId: string;
  selectedVideoDeviceId: string;
  mediaError: string | null;
  mediaLoading: boolean;
  onSelectAudioDevice: (deviceId: string) => void;
  onSelectVideoDevice: (deviceId: string) => void;
  onRetry: () => void;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
      <section className="w-full max-w-lg rounded-lg border border-border bg-card p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="device-settings-title">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 id="device-settings-title" className="text-lg font-semibold text-card-foreground">Dispositivos</h2>
            <p className="text-sm text-muted-foreground">Elige la entrada de audio y video para esta sala.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-2 text-muted-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Cerrar configuracion">
            <X className="h-5 w-5" />
          </button>
        </div>

        {mediaError ? (
          <p className="mb-4 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100" role="alert">{mediaError}</p>
        ) : null}

        <div className="space-y-4">
          <DeviceSelect
            id="audio-device"
            label="Microfono"
            devices={audioDevices}
            selectedDeviceId={selectedAudioDeviceId}
            fallbackLabel="Microfono"
            onChange={onSelectAudioDevice}
          />
          <DeviceSelect
            id="video-device"
            label="Camara"
            devices={videoDevices}
            selectedDeviceId={selectedVideoDeviceId}
            fallbackLabel="Camara"
            onChange={onSelectVideoDevice}
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2.5 font-medium transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary">
            Cerrar
          </button>
          <button type="button" onClick={onRetry} disabled={mediaLoading} className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60">
            {mediaLoading ? "Solicitando..." : "Probar dispositivos"}
          </button>
        </div>
      </section>
    </div>
  );
};

const DeviceSelect = ({
  id,
  label,
  devices,
  selectedDeviceId,
  fallbackLabel,
  onChange,
}: {
  id: string;
  label: string;
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  fallbackLabel: string;
  onChange: (deviceId: string) => void;
}) => {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-semibold text-card-foreground">{label}</span>
      <select
        id={id}
        value={selectedDeviceId}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-input bg-input-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {devices.length ? (
          devices.map((device, index) => (
            <option key={device.deviceId || `${id}-${index}`} value={device.deviceId}>
              {device.label || `${fallbackLabel} ${index + 1}`}
            </option>
          ))
        ) : (
          <option value="">Sin dispositivos detectados</option>
        )}
      </select>
    </label>
  );
};

const ControlButton = ({ icon, label, active, disabled, onClick }: { icon: ReactNode; label: string; active?: boolean; disabled?: boolean; onClick?: () => void }) => {
  const isDisabledState = active === false;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 min-w-12 shrink-0 items-center justify-center rounded-full px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary sm:min-w-24 sm:gap-1.5 sm:rounded-xl sm:px-4 ${
        isDisabledState ? "bg-red-400 text-white hover:bg-red-500" : "bg-accent text-accent-foreground hover:bg-accent/80"
      } disabled:cursor-not-allowed disabled:opacity-60`}
      aria-label={label}
      aria-pressed={typeof active === "boolean" ? active : undefined}
    >
      {icon}
      <span className="hidden text-xs font-semibold sm:inline">{label}</span>
    </button>
  );
};

const ChatMessage = ({ message, isYou, senderName }: { message: ChatMessage; isYou: boolean; senderName: string }) => {
  return (
    <div className={`flex flex-col ${isYou ? "items-end" : "items-start"}`}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{isYou ? "Tu" : senderName}</span>
        <span className="text-xs text-muted-foreground">{formatMessageTime(message.createdAt)}</span>
      </div>
      <div className={`max-w-[85%] rounded-xl px-4 py-2 ${isYou ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
        <p className="text-sm leading-relaxed">{message.message}</p>
      </div>
    </div>
  );
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "TU";
};

const getDisplayName = ({
  name,
  username,
  firstName,
  lastName,
  fallback,
}: {
  name?: string | null;
  username?: string;
  firstName?: string;
  lastName?: string;
  fallback: string;
}) => {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name?.trim() || fullName || username?.trim() || fallback;
};

const getPresenceName = (user: Pick<OnlineRoomUser, "displayName" | "userId">) => {
  return user.displayName?.trim() || `Participante ${user.userId.slice(0, 6)}`;
};

const formatMessageTime = (value?: string) => {
  if (!value) return "";

  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ensureReceiveTransceivers = (connection: RTCPeerConnection) => {
  ensureReceiveTransceiver(connection, "audio");
  ensureReceiveTransceiver(connection, "video");
};

const ensureReceiveTransceiver = (connection: RTCPeerConnection, kind: "audio" | "video") => {
  const hasTransceiver = connection.getTransceivers().some((transceiver) => {
    return transceiver.receiver.track.kind === kind || transceiver.sender.track?.kind === kind;
  });

  if (!hasTransceiver) connection.addTransceiver(kind, { direction: "recvonly" });
};

const syncLocalTracksToConnection = (connection: RTCPeerConnection, stream: MediaStream) => {
  syncLocalTrackToConnection(connection, stream, "audio");
  syncLocalTrackToConnection(connection, stream, "video");
};

const syncLocalTrackToConnection = (connection: RTCPeerConnection, stream: MediaStream, kind: "audio" | "video") => {
  const track = kind === "audio" ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
  if (!track) return;

  const transceiver = connection.getTransceivers().find((entry) => {
    return entry.receiver.track.kind === kind || entry.sender.track?.kind === kind;
  });

  if (transceiver) {
    transceiver.direction = "sendrecv";
    transceiver.sender.replaceTrack(track).catch(() => undefined);
    return;
  }

  connection.addTrack(track, stream);
};

const replaceVideoTrackInConnections = (
  connections: Record<string, RTCPeerConnection>,
  track: MediaStreamTrack | null,
  stream: MediaStream,
) => {
  Object.values(connections).forEach((connection) => {
    replaceVideoTrackInConnection(connection, track, stream);
  });
};

const replaceVideoTrackInConnection = (connection: RTCPeerConnection, track: MediaStreamTrack | null, stream: MediaStream) => {
  const transceiver = connection.getTransceivers().find((entry) => {
    return entry.receiver.track.kind === "video" || entry.sender.track?.kind === "video";
  });

  if (transceiver) {
    transceiver.direction = track ? "sendrecv" : "recvonly";
    transceiver.sender.replaceTrack(track).catch(() => undefined);
    return;
  }

  if (track) {
    connection.addTrack(track, stream);
  } else {
    ensureReceiveTransceiver(connection, "video");
  }
};

const mergeRemoteTrack = (currentStream: MediaStream | undefined, event: RTCTrackEvent) => {
  const nextStream = currentStream ?? event.streams[0] ?? new MediaStream();
  const alreadyHasTrack = nextStream.getTracks().some((track) => track.id === event.track.id);

  if (!alreadyHasTrack) nextStream.addTrack(event.track);

  return nextStream;
};

const mediaConstraintForDevice = (deviceId?: string): boolean | MediaTrackConstraints => {
  return deviceId ? { deviceId: { exact: deviceId } } : true;
};

export default Room;
