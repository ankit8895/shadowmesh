// Liveblocks type definitions. These drive useMyPresence, useOthers, useSelf
// and the rest of the React APIs.
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Real-time per-connection state shared with everyone in the room.
    Presence: {
      // Pointer position in canvas coordinates, or null when off-canvas.
      cursor: { x: number; y: number } | null;
      // True while this user's AI agent is generating on the canvas.
      isThinking: boolean;
    };

    // Identity attached when the auth route issues a session token.
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        cursorColor: string;
      };
    };
  }
}

export {};
