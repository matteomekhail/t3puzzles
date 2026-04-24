import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Shoo pairwise_sub — domain-scoped identity from the id_token
    shooSub: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    picture: v.optional(v.string()),
  }).index("by_shoo_sub", ["shooSub"]),

  puzzles: defineTable({
    title: v.string(),
    description: v.string(),
    // Store a hash of the answer, never the plaintext
    answerHash: v.string(),
    maxTries: v.number(),
    publishedAt: v.optional(v.number()),
    solvedBy: v.optional(v.id("users")),
    solvedAt: v.optional(v.number()),
  }).index("by_published", ["publishedAt"]),

  attempts: defineTable({
    userId: v.id("users"),
    puzzleId: v.id("puzzles"),
    guess: v.string(),
    correct: v.boolean(),
  })
    .index("by_user_puzzle", ["userId", "puzzleId"])
    .index("by_puzzle", ["puzzleId"]),
});
