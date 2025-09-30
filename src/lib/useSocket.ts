"use client";
import { io, Socket } from "socket.io-client";
import { useEffect, useRef } from "react";

export function useSocket() {
  const sockRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!sockRef.current) {
      sockRef.current = io({
        path: "/api/socket",
      });
    }
    return () => {
      sockRef.current?.disconnect();
    };
  }, []);

  return sockRef.current;
}
