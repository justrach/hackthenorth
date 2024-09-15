import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nanoid } from "nanoid";

// User CRUD operations
export const createUser = mutation({
  args: {
    username: v.string(),
    user_id: v.string(),
    name: v.string(),
    email: v.string(),
    profilePictureUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.array(v.string()),
    interests: v.array(v.string()),
    isOnboarded: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Check if the user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (existingUser) {
      return { userId: existingUser._id, isNew: false };
    }
    
    // Check if the username is already taken
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    if (existingUsername) {
      throw new Error("Username is already taken");
    }
    
    // Create the new user
    const userId = await ctx.db.insert("users", {
      id: identity.tokenIdentifier,
      uid: nanoid(),
      user_id: args.user_id,
      username: args.username,
      name: args.name,
      email: args.email,
      isOnboarded: false,
      profilePictureUrl: args.profilePictureUrl ?? "",
      bio: args.bio ?? "",
      skills: args.skills,
      interests: args.interests,
      isOnline: true,
      lastActive: new Date().toISOString(),
      attendedEvents: [],
    });
    
    return { userId, isNew: true };
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("users").collect();
    return rows.map((row) => row._id);
  },
});

// export const listUsersWithEmails = query({
//   args: {},
//   handler: async (ctx) => {
//     const users = await ctx.db.query("users").collect();
//     return users.map((user) => ({
//       id: user._id,
//       email: user.email,
//     }));
//   },
// });
export const listEmails = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((user) => user.email);
  },
});

export const getMeetupDetails = query({
  args: { meetupId: v.id("meetups") },
  handler: async (ctx, args) => {
    const meetup = await ctx.db.get(args.meetupId);
    if (!meetup) throw new Error("Meetup not found");

    let location = null;
    if (meetup.locationId) {
      const locationData = await ctx.db.get(meetup.locationId);
      if (locationData) {
        location = {
          name: locationData.name,
          url: locationData.url,
        };
      }
    }

    return {
      _id: meetup._id,
      name: meetup.name,
      description: meetup.description,
      meetupTime: meetup.meetupTime,
      location: location,
      creatorId: meetup.creatorId,
      participantIds: meetup.participantIds,
      status: meetup.status,
      createdAt: meetup.createdAt,
      maxParticipants: meetup.maxParticipants,
      isPublic: meetup.isPublic,
    };
  },
});
export const createPairMeetup = mutation({
  args: {
    eventId: v.id("events"),
    username1: v.string(),
    username2: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user1 = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username1))
      .first();
    
    const user2 = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username2))
      .first();
    
    if (!user1 || !user2) throw new Error("One or both users not found");
    
    const participantIds = [user1.user_id, user2.user_id];
    
    // Get all locations
    const locations = await ctx.db.query("locations").collect();
    if (locations.length === 0) throw new Error("No locations available");
    
    // Select a random location
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    const meetupId = await ctx.db.insert("meetups", {
      eventId: args.eventId,
      name: `${args.username1} and ${args.username2} Meetup`,
      description: `A meetup between ${args.username1} and ${args.username2}`,
      meetupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Set to 24 hours from now
      locationId: randomLocation._id,
      creatorId: user1._id, // Assuming user1 is the creator
      participantIds,
      status: "pending",
      createdAt: new Date().toISOString(),
      maxParticipants: 2,
      isPublic: false,
      invitedUsernames: [args.username1, args.username2],
      location: randomLocation.name, // Add the location name to the meetup
    });

    // Create meetup chat
    await ctx.db.insert("meetupChats", {
      meetupId,
      name: `${args.username1} and ${args.username2} Chat`,
      description: `Chat for the meetup between ${args.username1} and ${args.username2}`,
      participantIds,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    });

    return meetupId;
  },
});
export const listUsersWithEmails = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((user) => ({
      id: user._id,
      email: user.email,
      bio: user.bio,
      username: user.username,
      interests: user.interests,
    }));
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

    // Fetch all events
    const allEvents = await ctx.db
      .query("events")
      .collect();

    // Filter events where the user is an attendee
    return allEvents.filter(event => event.attendees.includes(user._id));
  },
});
// export const getUserByUsername = query({
//   args: { username: v.string() },
//   handler: async (ctx, args) => {
//     return await ctx.db
//       .query("users")
//       .withIndex("by_username", (q) => q.eq("username", args.username))
//       .first();
//   },
// });
export const getUserByUserID = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.user_id))
      .first();
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
    
    const initialInviteCode = nanoid(10);
    
    const eventId = await ctx.db.insert("events", {
      ...args,
      organizerId: user._id,
      attendees: [user._id],
      inviteCodes: [initialInviteCode],
    });
    
    // Update user's attendedEvents
    await ctx.db.patch(user._id, {
      attendedEvents: [...user.attendedEvents, eventId],
    });
    
    return { eventId, inviteCode: initialInviteCode };
  },
});

export const getEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    console.log(args.eventId);
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
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // Remove event from attendees' attendedEvents
    for (const attendeeId of event.attendees) {
      const attendee = await ctx.db.get(attendeeId);
      if (attendee) {
        await ctx.db.patch(attendeeId, {
          attendedEvents: attendee.attendedEvents.filter(id => id !== args.eventId),
        });
      }
    }

    await ctx.db.delete(args.eventId);
    return { success: true };
  },
});

export const generateInviteCode = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    
    const newCode = nanoid(10);
    const updatedInviteCodes = [...(event.inviteCodes || []), newCode];
    
    await ctx.db.patch(args.eventId, { inviteCodes: updatedInviteCodes });
    return newCode;
  },
});
export const getUserProfiles = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query('users')
      .collect();
    
    return users.map(user => ({
      user_id: user.user_id,
      username: user.username,
      profilePictureUrl: user.profilePictureUrl
    }));
  },
});
// ... existing code ...

export const getPersonalMeetupsByEventId = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");

    const meetups = await ctx.db
      .query("meetups")
      .filter((q) => 
        q.and(
          q.eq(q.field("eventId"), args.eventId),
          q.eq(q.field("isPublic"), false)
        )
      )
      .collect();

    // Filter meetups where the user is a participant
    return meetups.filter(meetup => meetup.participantIds.includes(user.user_id));
  },
});

export const getGlobalMeetupsByEventId = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db
      .query("meetups")
      .filter((q) => 
        q.and(
          q.eq(q.field("eventId"), args.eventId),
          q.eq(q.field("isPublic"), true)
        )
      )
      .collect();
  },
});
// ... existing code ...
export const joinEventWithCode = mutation({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
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
    
    const event = events.find(e => e.inviteCodes.includes(args.inviteCode));
    
    if (!event) throw new Error("Invalid invite code");
    
    if (event.attendees.includes(user._id)) {
      throw new Error("Already joined this event");
    }
    
    const updatedAttendees = [...event.attendees, user._id];
    await ctx.db.patch(event._id, { attendees: updatedAttendees });
    
    // Update user's attendedEvents
    await ctx.db.patch(user._id, {
      attendedEvents: [...user.attendedEvents, event._id],
    });
    
    return event._id;
  },
});

// Meetup CRUD operations
export const createMeetup = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    meetupTime: v.string(),
    locationName: v.string(),
    locationUrl: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
    isPublic: v.boolean(),
    invitedUsernames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");
    
    const participantIds = [user.user_id];

    // Add invited users
    for (const username of args.invitedUsernames) {
      const invitedUser = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .first();
      if (invitedUser) {
        participantIds.push(invitedUser.user_id);
      }
    }
    
    // Create the location
    const locationId = await ctx.db.insert("locations", {
      name: args.locationName,
      url: args.locationUrl,
    });
    
    const meetupId = await ctx.db.insert("meetups", {
      eventId: args.eventId,
      name: args.name,
      description: args.description,
      meetupTime: args.meetupTime,
      locationId,
      creatorId: user._id,
      participantIds,
      status: "pending",
      createdAt: new Date().toISOString(),
      maxParticipants: args.maxParticipants,
      isPublic: args.isPublic,
      invitedUsernames: args.invitedUsernames,
    });

    // Create meetup chat
    await ctx.db.insert("meetupChats", {
      meetupId,
      name: args.name,
      description: args.description,
      participantIds,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    });

    return meetupId;
  },
});

export const getMeetup = query({
  args: { meetupId: v.id("meetups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.meetupId);
  },
});
// Add this new query
export const getMeetupsByEventId = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meetups")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();
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
    
    if (meetup.participantIds.includes(user._id)) {
      throw new Error("Already joined this meetup");
    }
    
    if (meetup.maxParticipants && meetup.participantIds.length >= meetup.maxParticipants) {
      throw new Error("Meetup is full");
    }
    
    const updatedParticipantIds = [...meetup.participantIds, user._id];
    await ctx.db.patch(args.meetupId, { participantIds: updatedParticipantIds });
    
    return args.meetupId;
  },
});

export const inviteToMeetup = mutation({
  args: { 
    meetupId: v.id("meetups"),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const meetup = await ctx.db.get(args.meetupId);
    if (!meetup) throw new Error("Meetup not found");

    const invitedUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    if (!invitedUser) throw new Error("User not found");

    if (meetup.participantIds.includes(invitedUser._id)) {
      throw new Error("User is already in this meetup");
    }

    const updatedParticipantIds = [...meetup.participantIds, invitedUser._id];
    await ctx.db.patch(args.meetupId, { participantIds: updatedParticipantIds });

    return args.meetupId;
  },
});
export const createMeetupChat = mutation({
  args: {
    meetupId: v.id("meetups"),
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

    const meetup = await ctx.db.get(args.meetupId);
    if (!meetup) throw new Error("Meetup not found");
    
    const meetupChatId = await ctx.db.insert("meetupChats", {
      ...args,
      participantIds: meetup.participantIds,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    });

    return meetupChatId;
  },
});

export const getMeetupChat = query({
  args: { meetupChatId: v.id("meetupChats") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.meetupChatId);
  },
});
export const getMeetupChatId = query({
  args: { meetupId: v.id("meetups") },
  handler: async (ctx, args) => {
    const meetup = await ctx.db.get(args.meetupId);
    if (!meetup) throw new Error("Meetup not found");
    
    const meetupChat = await ctx.db
      .query("meetupChats")
      .filter((q) => q.eq(q.field("meetupId"), args.meetupId))
      .first();
    
    if (!meetupChat) throw new Error("Meetup chat not found");
    
    return meetupChat._id;
  },
});
// Message CRUD operations
export const createMessage = mutation({
  args: {
    content: v.string(),
    meetupChatId: v.id("meetupChats"),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("user_id"), args.user_id))
      .first();
    if (!user) throw new Error("User not found");
    
    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      meetupChatId: args.meetupChatId,
      senderId: args.user_id,
      timestamp: new Date().toISOString(),
    });

    // Update lastMessageAt in meetupChats
    await ctx.db.patch(args.meetupChatId, {
      lastMessageAt: new Date().toISOString(),
    });

    // Create message statuses for all participants
    const meetupChat = await ctx.db.get(args.meetupChatId);
    if (!meetupChat) throw new Error("Meetup chat not found");
    
    const currentTime = new Date().toISOString();
    for (const participantId of meetupChat.participantIds) {
      await ctx.db.insert("messageStatuses", {
        messageId,
        userId: participantId,
        deliveredAt: participantId === args.user_id ? currentTime : null,
        readAt: participantId === args.user_id ? currentTime : null,
      });
    }

    return messageId;
  },
});

export const getMessage = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return null;

    const statuses = await ctx.db
      .query("messageStatuses")
      .filter((q) => q.eq(q.field("messageId"), args.messageId))
      .collect();

    return { ...message, statuses };
  },
});

export const updateMessageStatus = mutation({
  args: {
    messageId: v.id("messages"),
    status: v.union(v.literal("delivered"), v.literal("read")),
    user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("user_id"), args.user_id))
      .first();
    
    if (!user) throw new Error("User not found");

    
    if (!user) throw new Error("User not found");
    console.log("User found:", user._id);

    console.log("Searching for message status with messageId:", args.messageId, "and userId:", user._id);
    const statusRecord = await ctx.db
      .query("messageStatuses")
      .filter((q) => 
        q.and(
          q.eq(q.field("messageId"), args.messageId),
          q.eq(q.field("userId"), user._id)
        )
      )
      .first();

    if (!statusRecord) {
      console.log("Message status not found for messageId:", args.messageId, "and userId:", user._id);
      throw new Error("Message status not found");
    }
    console.log("Status record found:", statusRecord);

    const updateFields: { deliveredAt?: string; readAt?: string } = {};
    if (args.status === "delivered" && !statusRecord.deliveredAt) {
      updateFields.deliveredAt = new Date().toISOString();
    }
    if (args.status === "read" && !statusRecord.readAt) {
      updateFields.readAt = new Date().toISOString();
      if (!statusRecord.deliveredAt) {
        updateFields.deliveredAt = updateFields.readAt;
      }
    }
    console.log("Update fields:", updateFields);

    await ctx.db.patch(statusRecord._id, updateFields);
    console.log("Status updated successfully");

    return statusRecord._id;
  },
});

export const getMessageStatuses = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messageStatuses")
      .filter((q) => q.eq(q.field("messageId"), args.messageId))
      .collect();
  },
});

export const getMeetupChatMessages = query({
  args: { 
    meetupChatId: v.id("meetupChats"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");

    let query = ctx.db
      .query("messages")
      .withIndex("by_meetupChatId", (q) => q.eq("meetupChatId", args.meetupChatId))
      .order("desc");

    if (args.cursor) {
      query = query.filter((q) => q.lt(q.field("_id"), args.cursor!));
    }

    const limit = args.limit ?? 50; // Default to 50 if not provided
    const messages = await query.take(limit);

    // Fetch all message statuses for the user
    const messageStatuses = await ctx.db
      .query("messageStatuses")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    // Create a map of message IDs to their statuses
    const messageStatusMap = new Map(
      messageStatuses.map(status => [status.messageId, status])
    );

    // Prepare the response
    const messagesWithStatus = messages.map(message => {
      const status = messageStatusMap.get(message._id);
      return {
        ...message,
        deliveredAt: status?.deliveredAt || null,
        readAt: status?.readAt || null,
        needsDeliveryUpdate: message.senderId !== user._id && !status?.deliveredAt,
      };
    });

    return messagesWithStatus;
  },
});

export const getUserChats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");

    // Fetch all meetup chats
    const meetupChats = await ctx.db
      .query("meetupChats")
      .collect();

    // Filter meetup chats where the user is a participant
    const userChats = meetupChats.filter(chat => chat.participantIds.includes(user._id));

    // For each chat, fetch the associated meetup details
    const chatsWithMeetupDetails = await Promise.all(userChats.map(async (chat) => {
      const meetup = await ctx.db.get(chat.meetupId);
      return {
        ...chat,
        meetupName: meetup?.name || "Unknown Meetup",
        meetupTime: meetup?.meetupTime || "Unknown Time",
      };
    }));

    return chatsWithMeetupDetails;
  },
});



export const createMissingMessageStatuses = mutation({
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    
    for (const message of messages) {
      const meetupChat = await ctx.db.get(message.meetupChatId);
      if (!meetupChat) continue;

      for (const participantId of meetupChat.participantIds) {
        const existingStatus = await ctx.db
          .query("messageStatuses")
          .filter((q) => 
            q.and(
              q.eq(q.field("messageId"), message._id),
              q.eq(q.field("userId"), participantId)
            )
          )
          .first();

        if (!existingStatus) {
          await ctx.db.insert("messageStatuses", {
            messageId: message._id,
            userId: participantId,
            deliveredAt: participantId === message.senderId ? message.timestamp : null,
            readAt: participantId === message.senderId ? message.timestamp : null,
          });
        }
      }
    }

    return "Migration completed";
  },
});

import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";



// HTTP action for email
export const getEmail = httpAction(async (ctx, request) => {
  const email = await ctx.runQuery(api.userFunctions.listEmails);
  return Response.json(email);
});

// HTTP action for list
export const getList = httpAction(async (ctx, request) => {
  const list = await ctx.runQuery(api.userFunctions.list);
  return Response.json(list);
});

// HTTP action for emailuserlist
export const getEmailUserList = httpAction(async (ctx, request) => {
  const emailUserList = await ctx.runQuery(api.userFunctions.listUsersWithEmails);
  return Response.json(emailUserList);
});


export const getAllMessages = query({
  handler: async (ctx) => {
    return await ctx.db.query("messages").collect();
  },
});

// Add this new HTTP action
export const getAllMessagesAction = httpAction(async (ctx, request) => {
  const messages = await ctx.runQuery(api.userFunctions.getAllMessages);
  return Response.json(messages);
});