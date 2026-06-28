import { z } from "zod";
import { MAX_TITLE_LENGTH, MAX_SYNC_PAYLOAD_SIZE } from "@/lib/utils/constants";

export const createDocumentSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(MAX_TITLE_LENGTH, `Title must be at most ${MAX_TITLE_LENGTH} characters`),
});

export const updateDocumentSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(MAX_TITLE_LENGTH, `Title must be at most ${MAX_TITLE_LENGTH} characters`)
    .optional(),
  contentPreview: z.string().max(10000).optional(),
});

export const addCollaboratorSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["editor", "viewer"], {
    error: "Role must be either 'editor' or 'viewer'",
  }),
});

export const updateCollaboratorRoleSchema = z.object({
  collaboratorId: z.string().uuid("Invalid collaborator ID"),
  role: z.enum(["editor", "viewer"], {
    error: "Role must be either 'editor' or 'viewer'",
  }),
});

export const createVersionSchema = z.object({
  label: z
    .string()
    .min(1, "Label is required")
    .max(100, "Label must be at most 100 characters"),
});

export const syncPayloadSchema = z.object({
  documentId: z.string().uuid("Invalid document ID"),
  update: z
    .string()
    .max(MAX_SYNC_PAYLOAD_SIZE, "Sync payload exceeds maximum size"),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type AddCollaboratorInput = z.infer<typeof addCollaboratorSchema>;
export type CreateVersionInput = z.infer<typeof createVersionSchema>;
