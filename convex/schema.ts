import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Game rooms for multiplayer matches
  rooms: defineTable({
    roomId: v.string(),
    hostId: v.id("users"),
    players: v.array(v.object({
      userId: v.id("users"),
      username: v.string(),
      isReady: v.boolean(),
    })),
    status: v.union(v.literal("waiting"), v.literal("playing"), v.literal("finished")),
    currentTurn: v.optional(v.id("users")),
    board: v.array(v.union(v.string(), v.null())), // 9 cells, null for empty, "X" or "O"
    winner: v.optional(v.union(v.id("users"), v.literal("draw"))),
    moveHistory: v.array(v.object({
      playerId: v.id("users"),
      cellIndex: v.number(),
      symbol: v.string(),
      timestamp: v.number(),
    })),
    createdAt: v.number(),
  })
    .index("by_room_id", ["roomId"])
    .index("by_host", ["hostId"])
    .index("by_status", ["status"]),

  // Match history for persistent records
  matches: defineTable({
    roomId: v.string(),
    players: v.array(v.object({
      userId: v.id("users"),
      username: v.string(),
      symbol: v.string(),
    })),
    winner: v.optional(v.union(v.id("users"), v.literal("draw"))),
    moveHistory: v.array(v.object({
      playerId: v.id("users"),
      cellIndex: v.number(),
      symbol: v.string(),
      timestamp: v.number(),
    })),
    duration: v.number(), // in milliseconds
    createdAt: v.number(),
  })
    .index("by_player", ["players"])
    .index("by_created_at", ["createdAt"]),

  // User stats for scoreboard
  userStats: defineTable({
    userId: v.id("users"),
    wins: v.number(),
    losses: v.number(),
    draws: v.number(),
    totalGames: v.number(),
    winRate: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_win_rate", ["winRate"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
