import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    id: v.string(),
    uid: v.string(),
    user_id: v.string(),
    username: v.string(),
    name: v.string(),
    email: v.string(),
    isOnboarded: v.boolean(),
    profilePictureUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.array(v.string()),
    interests: v.array(v.string()),
    isOnline: v.boolean(),
    lastActive: v.string(),
    attendedEvents: v.array(v.id("events")),
  })    .index("by_username", ["username"])
  .index("by_user_id", ["user_id"]),

  events: defineTable({
    name: v.string(),
    description: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    location: v.string(),
    organizerId: v.id("users"),
    attendees: v.array(v.id("users")),
    inviteCodes: v.array(v.string()),
  }),

  meetups: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    meetupTime: v.string(),
    location: v.string(),
    creatorId: v.id("users"),
    participantIds: v.array(v.id("users")),
    status: v.string(),
    createdAt: v.string(),
    maxParticipants: v.optional(v.number()),
  }).index("by_eventId", ["eventId"]),

  meetupChats: defineTable({
    meetupId: v.id("meetups"),
    name: v.string(),
    description: v.optional(v.string()),
    participantIds: v.array(v.id("users")),
    createdAt: v.string(),
    lastMessageAt: v.string(),
  }).index("by_meetupId", ["meetupId"]),

  messages: defineTable({
    content: v.string(),
    meetupChatId: v.id("meetupChats"),
    senderId: v.string(),  // Changed from v.id("users") to v.string()
    timestamp: v.string(),
  }).index("by_meetupChatId", ["meetupChatId"]),

  messageStatuses: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    deliveredAt: v.union(v.string(), v.null()),
    readAt: v.union(v.string(), v.null()),
  }),
  aiSuggestions: defineTable({
    userId: v.id("users"),
    suggestedUserIds: v.array(v.id("users")),
    reason: v.string(),
    eventId: v.id("events"),
    timestamp: v.string(),
  }),
});