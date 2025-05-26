import { z } from "zod";

export const GroupSchema = z.object({
	_id: z.string(),
	name: z.string().min(1).max(100),
	description: z.string().max(500).nullable(),
	isPublic: z.boolean(),
	accessKey: z.string().optional(),
	adminPassword: z.string(), // Hashed
	tags: z.array(z.string()).max(10),
	questionCount: z.number().int().min(0).default(0),
	lastActivityAt: z.date(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const CreateGroupSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	isPublic: z.boolean(),
	adminPassword: z.string().min(6),
	tags: z.array(z.string()).max(10).default([]),
});

export const UpdateGroupSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	description: z.string().max(500).nullable().optional(),
	isPublic: z.boolean().optional(),
	tags: z.array(z.string()).max(10).optional(),
	adminPassword: z.string().min(6),
});

export type Group = z.infer<typeof GroupSchema>;
export type CreateGroup = z.infer<typeof CreateGroupSchema>;
export type UpdateGroup = z.infer<typeof UpdateGroupSchema>;
