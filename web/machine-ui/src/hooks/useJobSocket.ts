/**
 * useJobSocket — React hook that connects machine-ui to the central Server via Socket.IO
 * instead of polling the local Agent's SSE endpoint directly.
 *
 * The hook:
 *  1. Connects to SERVER_SOCKET_URL (env: NEXT_PUBLIC_SERVER_SOCKET_URL)
 *  2. Joins room = machine_code (NEXT_PUBLIC_MACHINE_CODE, default "MP1-001")
 *  3. Listens for `job.start` and `job.state` / `job.progress` events
 *  4. Exposes agentJobState, agentCurrentItemIndex, globalTimeLeft, and connection status
 *
 * This replaces the old EventSource approach that required the local agent to be reachable.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export type AgentJobState =
  | "TRANSFER_TO_OVEN"
  | "HEATING"
  | "DISPENSING"
  | "DONE"
  | "ERROR";

export interface JobSocketState {
  /** Current machine job state as reported by the agent → server */
  agentJobState: AgentJobState | null;
  /** Index of the item currently being processed */
  agentCurrentItemIndex: number;
  /** Remaining seconds (live from agent events) */
  globalTimeLeft: number;
  /** Whether the Socket.IO connection to server is established */
  isConnected: boolean;
}

export interface UseJobSocketOptions {
  /** The charge_id / job_id to watch. Starts listening only when set. */
  activeJobId: string | null;
  /** Called when job is active so the hook can request the server to re-send pending jobs */
  onConnect?: () => void;
}

export function useJobSocket({
  activeJobId,
  onConnect,
}: UseJobSocketOptions): JobSocketState {
  const serverUrl =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_SERVER_SOCKET_URL) ||
    "http://localhost:8000";
  const machineCode =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_MACHINE_CODE) ||
    "MP1-001";

  const socketRef = useRef<Socket | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [agentJobState, setAgentJobState] = useState<AgentJobState | null>(
    null
  );
  const [agentCurrentItemIndex, setAgentCurrentItemIndex] = useState(0);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(0);

  const resetJobState = useCallback(() => {
    setAgentJobState(null);
    setAgentCurrentItemIndex(0);
    setGlobalTimeLeft(0);
  }, []);

  useEffect(() => {
    // Create (or reuse) singleton socket
    if (!socketRef.current) {
      socketRef.current = io(serverUrl, {
        transports: ["websocket"],
        auth: {
          // No HMAC needed from browser client — browser listens only, machines authenticate
          machine_code: machineCode,
        },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
      });
    }

    const socket = socketRef.current;

    const onConnectEvt = () => {
      setIsConnected(true);
      // Join the machine's room
      socket.emit("machine_ready", { machine_code: machineCode });
      onConnect?.();
    };

    const onDisconnect = () => setIsConnected(false);

    /**
     * job.start: emitted by server when a new job is dispatched to this machine.
     * We just note its arrival — actual state changes come via machine_event.
     */
    const onJobStart = (data: { job_id?: string; [key: string]: unknown }) => {
      if (activeJobId && data?.job_id !== activeJobId) return;
      // Reset so the processing screen reflects fresh state
      resetJobState();
    };

    /**
     * job_event_broadcast: server broadcasts machine events to the machine's room
     * so that the browser UI receives real-time job progress without polling the agent.
     *
     * Expected shape (same as machine_event payload from agent → server):
     * {
     *   job_id, machine_code, event_type, state, seq,
     *   payload: { remaining_seconds, current_item_index, ... }
     * }
     */
    const onJobEventBroadcast = (data: {
      job_id?: string;
      state?: AgentJobState;
      event_type?: string;
      seq?: number;
      payload?: {
        remaining_seconds?: number;
        current_item_index?: number;
      };
    }) => {
      // Only process events for the active job
      if (!activeJobId || data?.job_id !== activeJobId) return;

      const state = data?.state as AgentJobState | undefined;
      if (state) setAgentJobState(state);

      const payload = data?.payload || {};
      if (typeof payload.remaining_seconds === "number") {
        setGlobalTimeLeft(payload.remaining_seconds);
      }
      if (typeof payload.current_item_index === "number") {
        setAgentCurrentItemIndex(payload.current_item_index);
      }
    };

    socket.on("connect", onConnectEvt);
    socket.on("disconnect", onDisconnect);
    socket.on("job.start", onJobStart);
    socket.on("job_event_broadcast", onJobEventBroadcast);

    // If already connected when the hook re-runs (e.g. activeJobId changed), sync state
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off("connect", onConnectEvt);
      socket.off("disconnect", onDisconnect);
      socket.off("job.start", onJobStart);
      socket.off("job_event_broadcast", onJobEventBroadcast);
    };
  }, [serverUrl, machineCode, activeJobId, onConnect, resetJobState]);

  // Reset job state when a new job starts
  useEffect(() => {
    if (!activeJobId) resetJobState();
  }, [activeJobId, resetJobState]);

  return {
    agentJobState,
    agentCurrentItemIndex,
    globalTimeLeft,
    isConnected,
  };
}
