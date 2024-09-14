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


if they give incliude./ or anything taht doesnt make sense;
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
      .filter((q) => q.eq(q.field("participantIds").contains(user._id), true))
      .order("desc");

    if (args.cursor) {
      queryBuilder = queryBuilder.filter((q) => q.gt(q.field("_id"), args.cursor!));
    }

    const limit = args.limit ?? 50; // Default to 50 if not provided

    return queryBuilder.take(limit);
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
      .filter((q) => q.eq(q.field("attendees").contains(user._id), true))
      .collect();

    return events;
  },
});


This is how you construct a query with a limit and a cursor: