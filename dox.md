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
This is how you construct a query with a limit and a cursor: