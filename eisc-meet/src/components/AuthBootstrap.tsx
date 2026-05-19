import { useEffect, type ReactNode } from "react";
import { socket } from "../sockets/socketManager";
import useAuthStore from "../stores/useAuthStore";

const AuthBootstrap = ({ children }: { children: ReactNode }) => {
  const initAuthObserver = useAuthStore((state) => state.initAuthObserver);
  const authUser = useAuthStore((state) => state.authUser);

  useEffect(() => {
    const unsubscribe = initAuthObserver();
    return unsubscribe;
  }, [initAuthObserver]);

  useEffect(() => {
    if (authUser?.uid) {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit("newUser", authUser.uid);
      return;
    }

    if (socket.connected) {
      socket.disconnect();
    }
  }, [authUser?.uid]);

  return children;
};

export default AuthBootstrap;
