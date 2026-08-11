import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  caseStudies: defineTable({
    caseId: v.string(),
    shareSlug: v.string(),
    published: v.boolean(),
    /** JSON-serialized CaseStudy payload */
    data: v.string(),
    updatedAt: v.number(),
  })
    .index("by_caseId", ["caseId"])
    .index("by_shareSlug", ["shareSlug"]),
});
