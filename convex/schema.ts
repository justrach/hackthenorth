// NOTE: You can remove this file. Declaring the shape
// of the database is entirely optional in Convex.
// See https://docs.convex.dev/database/schemas.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {


    users: defineTable({
  bio: v.optional(v.string()),
  createdAt: v.optional(v.string()),
  dateOfBirth: v.optional(v.string()),
  dietaryPreferences: v.optional(v.array(v.string())),
  email: v.optional(v.string()),
  friend_username: v.optional(v.string()),
  gender: v.optional(v.string()),
  id: v.optional(v.float64()),
  location: v.optional(v.object({
    city: v.optional(v.string()),
    coordinates: v.optional(v.array(v.float64())),
    country: v.optional(v.string()),
  })),
  online_username: v.optional(v.string()),
  profilePictureUrl: v.optional(v.string()),
  role: v.optional(v.string()),
  showExactDateOfBirth: v.optional(v.boolean()),
  tasteDimensions: v.optional(v.array(v.number())),
  updatedAt: v.optional(v.string()),
  isOnboaded: v.optional(v.boolean()),
}),
    documents: defineTable({
      fieldOne: v.string(),
      fieldTwo: v.object({
        subFieldOne: v.array(v.number()),
      }),
    }),
    // This definition matches the example query and mutation code:
    numbers: defineTable({
      value: v.number(),
    }),
    food_places: defineTable({
      address: v.union(v.null(), v.string()),
      cafeornot: v.boolean(),
      category: v.union(v.null(), v.string()),
      cid: v.string(),
      crs: v.null(),
      location_coordinates: v.array(v.float64()),
      rating: v.union(v.null(), v.float64()),
      ratingcount: v.union(v.null(), v.float64()),
      thumbnailurl: v.null(),
      title: v.string(),
      types: v.array(v.string()),
      uuid: v.string(),
    }),
    food_places2: defineTable({
      address: v.union(v.null(), v.string()),
      category: v.union(v.null(), v.string()),
      cid: v.string(),
      location_coordinates: v.array(v.float64()),
      rating: v.union(v.null(), v.float64()),
      title: v.string(),
      types: v.array(v.string()),
    }),
    food_places3: defineTable({
      address: v.union(v.null(), v.string()),
      cafeornot: v.boolean(),
      category: v.union(v.null(), v.string()),
      cid: v.string(),
      crs: v.null(),
      location_coordinates: v.array(v.float64()),
      rating: v.union(v.null(), v.float64()),
      ratingcount: v.union(v.null(), v.float64()),
      thumbnailurl: v.null(),
      title: v.string(),
      types: v.array(v.string()),
      uuid: v.string(),
    }),
    
  },
  // If you ever get an error about schema mismatch
  // between your data and your schema, and you cannot
  // change the schema to match the current data in your database,
  // you can:
  //  1. Use the dashboard to delete tables or individual documents
  //     that are causing the error.
  //  2. Change this option to `false` and make changes to the data
  //     freely, ignoring the schema. Don't forget to change back to `true`!

  
  { schemaValidation: true }
);
