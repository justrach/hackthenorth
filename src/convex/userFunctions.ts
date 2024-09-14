import { v } from "convex/values";
import { query, mutation, action, QueryCtx } from "./_generated/server";
import { Auth, OrderedQuery, UserIdentity } from "convex/server";
import { nanoid } from "nanoid";
import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions';
import { Id, TableNames } from "./_generated/dataModel";

// Helper function to get user ID
async function getUserId(ctx: { auth: Auth }) {
  const authInfo = await ctx.auth.getUserIdentity();
  return authInfo;
}

// Custom query with user context
export const queryWithUser = customQuery(
  query,
  customCtx(async (ctx) => {
    return {
      userId: await getUserId(ctx),
    };
  }),
);

// User CRUD operations
export const createUser = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await getUserId(ctx);
    if (!user) throw new Error("Not authenticated");
    
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), user.tokenIdentifier))
      .first();
    
    if (existingUser) {
      return { userId: existingUser._id, isNew: false };
    }
    
    const userId = await ctx.db.insert("users", {
      id: user.tokenIdentifier,
      uid: nanoid(),
      name: user.name ?? "",
      email: user.email ?? "",
      isOnboarded: false,
      profilePictureUrl: "",
      bio: "",
      skills: [],
      interests: [],
      isOnline: true,
      lastActive: new Date().toISOString(),
      attendedEvents: [],
    });
    
    return { userId, isNew: true };
  }),
);

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    interests: v.optional(v.array(v.string())),
    isOnboarded: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");
    
    await ctx.db.patch(user._id, args);
    return user._id;
  },
});

export const deleteUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");
    
    await ctx.db.delete(user._id);
    return { success: true };
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");
    
    return await ctx.db.insert("events", {
      ...args,
      organizerId: user._id,
      attendees: [],
    });
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
    return eventId;
  },
});

export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.eventId);
    return { success: true };
  },
});
export const listEvents = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    const { limit, cursor } = args;
    let queryBuilder = ctx.db.query("events").order("desc");
    
    if (cursor) {
      queryBuilder = queryBuilder.filter((q) => q.gt(q.field("_id"), cursor));
    }
    
    const effectiveLimit = limit ?? 100; // Use provided limit or default to 100
    
    return queryBuilder.take(effectiveLimit);
  },
});

// Meetup CRUD operations
export const createMeetup = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    meetupTime: v.string(),
    location: v.string(),
    maxParticipants: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");
    
    return await ctx.db.insert("meetups", {
      ...args,
      creatorId: user._id,
      participantIds: [user._id],
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

export const updateMeetup = mutation({
  args: {
    meetupId: v.id("meetups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    meetupTime: v.optional(v.string()),
    location: v.optional(v.string()),
    status: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { meetupId, ...updateFields } = args;
    await ctx.db.patch(meetupId, updateFields);
    return meetupId;
  },
});

export const deleteMeetup = mutation({
  args: { meetupId: v.id("meetups") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.meetupId);
    return { success: true };
  },
});

export const joinMeetup = mutation({
  args: { meetupId: v.id("meetups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");
    
    const meetup = await ctx.db.get(args.meetupId);
    if (!meetup) throw new Error("Meetup not found");
    
    if (meetup.maxParticipants && meetup.participantIds.length >= meetup.maxParticipants) {
      throw new Error("Meetup is full");
    }
    
    await ctx.db.patch(args.meetupId, {
      participantIds: [...meetup.participantIds, user._id],
    });
    
    return args.meetupId;
  },
});

// Chat Group CRUD operations
export const createChatGroup = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");
    
    return await ctx.db.insert("chatGroups", {
      ...args,
      creatorId: user._id,
      participantIds: [user._id],
      createdAt: new Date().toISOString(),
    });
  },
});

export const getChatGroup = query({
  args: { chatGroupId: v.id("chatGroups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.chatGroupId);
  },
});

export const updateChatGroup = mutation({
  args: {
    chatGroupId: v.id("chatGroups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { chatGroupId, ...updateFields } = args;
    await ctx.db.patch(chatGroupId, updateFields);
    return chatGroupId;
  },
});

export const deleteChatGroup = mutation({
  args: { chatGroupId: v.id("chatGroups") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.chatGroupId);
    return { success: true };
  },
});

export const joinChatGroup = mutation({
  args: { chatGroupId: v.id("chatGroups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");
    
    const chatGroup = await ctx.db.get(args.chatGroupId);
    if (!chatGroup) throw new Error("Chat group not found");
    
    await ctx.db.patch(args.chatGroupId, {
      participantIds: [...chatGroup.participantIds, user._id],
    });
    
    return args.chatGroupId;
  },
});

// Message operations
export const sendMessage = mutation({
  args: {
    content: v.string(),
    recipientType: v.union(v.literal("meetup"), v.literal("chatGroup")),
    recipientId: v.union(v.id("meetups"), v.id("chatGroups")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");
    
    return await ctx.db.insert("messages", {
      ...args,
      senderId: user._id,
      timestamp: new Date().toISOString(),
    });
  },
});

export const getMessages = query({
  args: {
    recipientType: v.union(v.literal("meetup"), v.literal("chatGroup")),
    recipientId: v.union(v.id("meetups"), v.id("chatGroups")),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const { recipientType, recipientId, limit, cursor } = args;
    let query = ctx.db.query("messages")
      .filter((q) => 
        q.and(
          q.eq(q.field("recipientType"), recipientType),
          q.eq(q.field("recipientId"), recipientId)
        )
      )
      .order("desc");
    
    if (cursor) {
      query = query.filter((q) => q.lt(q.field("_id"), cursor));
    }
    
    if (limit) {
      return query.take(limit);
    }
    
    return query;
  },
});

// AI Suggestion operations
export const createAiSuggestion = mutation({
  args: {
    suggestedUserIds: v.array(v.id("users")),
    reason: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");
    
    return await ctx.db.insert("aiSuggestions", {
      ...args,
      userId: user._id,
      timestamp: new Date().toISOString(),
    });
  },
});
export const getAiSuggestions = query({
  args: { 
    eventId: v.id("events"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("aiSuggestions")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");

    const { eventId, limit, cursor } = args;
    let query = ctx.db.query("aiSuggestions")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("eventId"), eventId)
        )
      )
      .order("desc");
    
    if (cursor) {
      query = query.filter((q) => q.lt(q.field("_id"), cursor));
    }
    
    if (limit) {
      return query.take(limit);
    }
    
    return query;
  },
});

// User data initialization and retrieval
export const write_user_data = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await getUserId(ctx);
    if (!user) throw new Error("Not authenticated");

    const user_data = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), user.tokenIdentifier))
      .collect();

    if (user_data.length == 0) {
      const userId = await ctx.db.insert("users", {
        id: user.tokenIdentifier,
        uid: nanoid(),
        isOnboarded: false,
      });
      
      return {
        initialized: true,
        user_data: [await ctx.db.get(userId)],
        isOnboarded: false
      };
    } else {
      return {
        initialized: true,
        user_data: user_data,
        isOnboarded: user_data[0].isOnboarded
      };
    }
  }),
);

export const user_data = queryWithUser({
  handler: async (ctx, args) => {
    if (ctx.userId === undefined) {
      return null;
    }
    const user = ctx.userId;
    const user_data = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), user!.tokenIdentifier))
      .collect();

    return { user_data: user_data };
  },
});

export const init_user = write_user_data({
  handler: async (ctx, args) => {
    return {
      initialized: ctx.initialized,
      user_data: ctx.user_data,
      isOnboarded: ctx.isOnboarded
    };
  },
});

// Event Registration
export const registerForEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // Update user's attended events
    await ctx.db.patch(user._id, {
      attendedEvents: [...(user.attendedEvents || []), args.eventId],
    });

    // Update event's attendees
    await ctx.db.patch(args.eventId, {
      attendees: [...(event.attendees || []), user._id],
    });

    return { success: true };
  },
});

// Helper function to get user data
export const getUserData = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();

    return user;
  },
});

// Helper function to check if a user is authenticated
export const isAuthenticated = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return !!identity;
  },
});

// Helper function to get user's events
export const getUserMeetups = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("meetups")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    let queryBuilder = ctx.db
      .query("meetups")
      .order("desc");

    if (args.cursor) {
      queryBuilder = queryBuilder.filter((q) => q.gt(q.field("_id"), args.cursor!));
    }

    const limit = args.limit ?? 50; // Default to 50 if not provided

    const meetups = await queryBuilder.take(limit);

    // Filter meetups client-side to ensure user is a participant
    return meetups.filter(meetup => meetup.participantIds.includes(user._id));
  },
});

export const getUserEvents = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    const events = await ctx.db
      .query("events")
      .collect();

    // Filter events client-side to ensure user is an attendee
    return events.filter(event => event.attendees.includes(user._id));
  },
});
// Helper function to get user's chat groups
export const getUserChatGroups = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    const chatGroups = await ctx.db
      .query("chatGroups")
      .collect();

    // Filter chat groups client-side to ensure user is a participant
    return chatGroups.filter(chatGroup => chatGroup.participantIds.includes(user._id));
  },
});