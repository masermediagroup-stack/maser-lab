import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const recordValidator = v.object({
  _id: v.id("caseStudies"),
  caseId: v.string(),
  shareSlug: v.string(),
  published: v.boolean(),
  data: v.string(),
  updatedAt: v.number(),
});

export const list = query({
  args: {},
  returns: v.array(recordValidator),
  handler: async (ctx) => {
    return await ctx.db.query("caseStudies").order("desc").collect();
  },
});

export const getByCaseId = query({
  args: { caseId: v.string() },
  returns: v.union(recordValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("caseStudies")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .unique();
  },
});

export const getPublishedByShareSlug = query({
  args: { shareSlug: v.string() },
  returns: v.union(recordValidator, v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("caseStudies")
      .withIndex("by_shareSlug", (q) => q.eq("shareSlug", args.shareSlug))
      .unique();
    if (!row || !row.published) return null;
    return row;
  },
});

export const upsert = mutation({
  args: {
    caseId: v.string(),
    shareSlug: v.string(),
    published: v.boolean(),
    data: v.string(),
    updatedAt: v.number(),
  },
  returns: v.id("caseStudies"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("caseStudies")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        shareSlug: args.shareSlug,
        published: args.published,
        data: args.data,
        updatedAt: args.updatedAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("caseStudies", args);
  },
});

export const remove = mutation({
  args: { caseId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("caseStudies")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});

export const setPublished = mutation({
  args: {
    caseId: v.string(),
    shareSlug: v.string(),
    published: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("caseStudies")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .unique();
    if (!existing) {
      throw new Error("Case study not found in cloud — sync before publishing.");
    }
    await ctx.db.patch(existing._id, {
      published: args.published,
      shareSlug: args.shareSlug,
      updatedAt: Date.now(),
    });
    return null;
  },
});
