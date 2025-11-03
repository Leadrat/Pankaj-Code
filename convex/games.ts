import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Generate a random 6-character room ID
function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Check if there's a winner on the board
function checkWinner(board: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

// Check if board is full (draw)
function isBoardFull(board: (string | null)[]): boolean {
  return board.every(cell => cell !== null);
}

// Create a new game room
export const createRoom = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const roomId = generateRoomId();
    
    const roomDocId = await ctx.db.insert("rooms", {
      roomId,
      hostId: userId,
      players: [{
        userId,
        username: user.name || user.email || "Anonymous",
        isReady: false,
      }],
      status: "waiting",
      board: Array(9).fill(null),
      moveHistory: [],
      createdAt: Date.now(),
    });

    return { roomId, roomDocId };
  },
});

// Join an existing room
export const joinRoom = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!room) throw new Error("Room not found");
    if (room.status !== "waiting") throw new Error("Room is not available");
    if (room.players.length >= 2) throw new Error("Room is full");
    if (room.players.some(p => p.userId === userId)) throw new Error("Already in room");

    const updatedPlayers = [...room.players, {
      userId,
      username: user.name || user.email || "Anonymous",
      isReady: false,
    }];

    await ctx.db.patch(room._id, {
      players: updatedPlayers,
    });

    return room._id;
  },
});

// Toggle ready status
export const toggleReady = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!room) throw new Error("Room not found");

    const playerIndex = room.players.findIndex(p => p.userId === userId);
    if (playerIndex === -1) throw new Error("Not in this room");

    const updatedPlayers = [...room.players];
    updatedPlayers[playerIndex].isReady = !updatedPlayers[playerIndex].isReady;

    // Start game if both players are ready
    let updates: any = { players: updatedPlayers };
    if (updatedPlayers.length === 2 && updatedPlayers.every(p => p.isReady)) {
      updates.status = "playing";
      updates.currentTurn = room.hostId; // Host goes first
    }

    await ctx.db.patch(room._id, updates);
  },
});

// Make a move
export const makeMove = mutation({
  args: { 
    roomId: v.string(), 
    cellIndex: v.number() 
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!room) throw new Error("Room not found");
    if (room.status !== "playing") throw new Error("Game not in progress");
    if (room.currentTurn !== userId) throw new Error("Not your turn");
    if (room.board[args.cellIndex] !== null) throw new Error("Cell already occupied");

    const playerIndex = room.players.findIndex(p => p.userId === userId);
    const symbol = playerIndex === 0 ? "X" : "O";
    
    const newBoard = [...room.board];
    newBoard[args.cellIndex] = symbol;

    const move = {
      playerId: userId,
      cellIndex: args.cellIndex,
      symbol,
      timestamp: Date.now(),
    };

    const newMoveHistory = [...room.moveHistory, move];

    // Check for winner or draw
    const winner = checkWinner(newBoard);
    const isDraw = !winner && isBoardFull(newBoard);

    let updates: any = {
      board: newBoard,
      moveHistory: newMoveHistory,
    };

    if (winner || isDraw) {
      updates.status = "finished";
      updates.winner = winner ? userId : "draw";
      
      // Schedule match completion
      await ctx.scheduler.runAfter(0, internal.games.completeMatch, {
        roomId: args.roomId,
      });
    } else {
      // Switch turns
      const otherPlayer = room.players.find(p => p.userId !== userId);
      updates.currentTurn = otherPlayer?.userId;
    }

    await ctx.db.patch(room._id, updates);
  },
});

// Get room details
export const getRoom = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .first();

    return room;
  },
});

// Complete match and update stats
export const completeMatch = internalMutation({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!room || room.status !== "finished") return;

    // Save match to history
    await ctx.db.insert("matches", {
      roomId: room.roomId,
      players: room.players.map((p, i) => ({
        userId: p.userId,
        username: p.username,
        symbol: i === 0 ? "X" : "O",
      })),
      winner: room.winner,
      moveHistory: room.moveHistory,
      duration: room.moveHistory.length > 0 
        ? room.moveHistory[room.moveHistory.length - 1].timestamp - room.moveHistory[0].timestamp
        : 0,
      createdAt: Date.now(),
    });

    // Update player stats
    for (const player of room.players) {
      let existingStats = await ctx.db
        .query("userStats")
        .withIndex("by_user", (q) => q.eq("userId", player.userId))
        .first();

      if (!existingStats) {
        const statsId = await ctx.db.insert("userStats", {
          userId: player.userId,
          wins: 0,
          losses: 0,
          draws: 0,
          totalGames: 0,
          winRate: 0,
        });
        existingStats = await ctx.db.get(statsId);
      }

      if (!existingStats) continue;

      let wins = existingStats.wins;
      let losses = existingStats.losses;
      let draws = existingStats.draws;

      if (room.winner === "draw") {
        draws++;
      } else if (room.winner === player.userId) {
        wins++;
      } else {
        losses++;
      }

      const totalGames = wins + losses + draws;
      const winRate = totalGames > 0 ? wins / totalGames : 0;

      await ctx.db.patch(existingStats._id, {
        wins,
        losses,
        draws,
        totalGames,
        winRate,
      });
    }
  },
});

// Get user stats
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return stats;
  },
});

// Get match history for user
export const getMatchHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const matches = await ctx.db
      .query("matches")
      .order("desc")
      .collect();

    return matches.filter(match => 
      match.players.some(p => p.userId === userId)
    ).slice(0, 20); // Last 20 matches
  },
});

// Get leaderboard
export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_win_rate", (q) => q.gt("winRate", 0))
      .order("desc")
      .take(10);

    const leaderboard = [];
    for (const stat of stats) {
      const user = await ctx.db.get(stat.userId);
      if (user && stat.totalGames >= 3) { // Only show users with at least 3 games
        leaderboard.push({
          username: user.name || user.email || "Anonymous",
          ...stat,
        });
      }
    }

    return leaderboard;
  },
});

// Leave room
export const leaveRoom = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!room) return;

    const updatedPlayers = room.players.filter(p => p.userId !== userId);
    
    if (updatedPlayers.length === 0) {
      // Delete room if empty
      await ctx.db.delete(room._id);
    } else {
      // Update room
      await ctx.db.patch(room._id, {
        players: updatedPlayers,
        status: "waiting",
        currentTurn: undefined,
      });
    }
  },
});
