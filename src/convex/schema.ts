import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { Auth } from "convex/server";
import { Id } from "./_generated/dataModel";

// User CRUD operations
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    profilePictureUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.array(v.string()),
    interests: v.array(v.string()),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.insert("users", {
      uid: identity.tokenIdentifier,
      name: args.name,
      email: args.email,
      profilePictureUrl: args.profilePictureUrl,
      bio: args.bio,
      skills: args.skills,
      interests: args.interests,
      eventId: args.eventId,
      isOnline: true,
      lastActive: new Date().toISOString(),
    });
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    interests: v.optional(v.array(v.string())),
    eventId: v.optional(v.id("events")),
    isOnline: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updateFields } = args;
    await ctx.db.patch(userId, updateFields);
  },
});

// Event CRUD operations
export const createEvent = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", args);
  },
});

export const getEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { eventId, ...updateFields } = args;
    await ctx.db.patch(eventId, updateFields);
  },
});

// Meetup CRUD operations
export const createMeetup = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    participantIds: v.array(v.id("users")),
    meetupTime: v.string(),
    location: v.string(),
    topic: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("meetups", {
      ...args,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  },
});

export const getMeetup = query({
  args: { meetupId: v.id("meetups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.meetupId);
  },
});

export const updateMeetupStatus = mutation({
  args: {
    meetupId: v.id("meetups"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.meetupId, { status: args.status });
  },
});

export const addParticipantToMeetup = mutation({
  args: {
    meetupId: v.id("meetups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const meetup = await ctx.db.get(args.meetupId);
    if (!meetup) throw new Error("Meetup not found");
    
    const updatedParticipantIds = [...meetup.participantIds, args.userId];
    await ctx.db.patch(args.meetupId, { participantIds: updatedParticipantIds });
  },
});

// Message operations
export const sendMessage = mutation({
  args: {
    meetupId: v.id("meetups"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("messages", {
      meetupId: args.meetupId,
      senderId: identity.tokenIdentifier,
      content: args.content,
      timestamp: new Date().toISOString(),
    });
  },
});

export const getMessages = query({
  args: { meetupId: v.id("meetups") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter(q => q.eq(q.field("meetupId"), args.meetupId))
      .order("asc")
      .collect();
  },
});

// AI Suggestion operations
export const createAiSuggestion = mutation({
  args: {
    userId: v.id("users"),
    suggestedUserIds: v.array(v.id("users")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiSuggestions", {
      ...args,
      timestamp: new Date().toISOString(),
    });
  },
});

export const getAiSuggestions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiSuggestions")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

// Helper function
async function getUserId(ctx: { auth: Auth }) {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.tokenIdentifier;
}