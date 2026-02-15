import { defineField, defineType } from "sanity";

export const paymentRequestType = defineType({
  name: "paymentRequest",
  title: "Payment Request",
  type: "document",
  fields: [
    defineField({
      name: "clerkUserId",
      title: "Clerk User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "userEmail",
      title: "User Email",
      type: "string",
    }),
    defineField({
      name: "userName",
      title: "User Name",
      type: "string",
    }),
    defineField({
      name: "requestedTier",
      title: "Requested Tier",
      type: "string",
      options: {
        list: [
          { title: "Pro", value: "pro" },
          { title: "Ultra", value: "ultra" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
    }),
    defineField({
      name: "referenceId",
      title: "Transaction / Reference ID",
      type: "string",
    }),
    defineField({
      name: "notes",
      title: "User Notes",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "proofImage",
      title: "Payment Proof Screenshot",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "reviewNotes",
      title: "Review Notes",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "reviewedAt",
      title: "Reviewed At",
      type: "datetime",
    }),
    defineField({
      name: "reviewedBy",
      title: "Reviewed By (Admin Clerk ID)",
      type: "string",
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      email: "userEmail",
      tier: "requestedTier",
      status: "status",
    },
    prepare({ email, tier, status }) {
      const tierLabel =
        typeof tier === "string" ? tier.toUpperCase() : "UNKNOWN TIER";
      const statusLabel =
        typeof status === "string" ? status.toUpperCase() : "UNKNOWN STATUS";

      return {
        title: `${tierLabel} request`,
        subtitle: `${email || "Unknown user"} - ${statusLabel}`,
      };
    },
  },
});
