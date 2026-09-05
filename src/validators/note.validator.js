import { z } from "zod";

const noteSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(100, "Title must be at most 100 characters"),
    description: z.string().trim().max(5000, "Description must be at most 5000 characters").optional().default(""),
    lists: z.array(z.object({
        _id: z.string().optional(),
        title: z.string().optional().default(""),
        type: z.enum(['checklist', 'bullet']).default('checklist'),
        items: z.array(z.object({
            _id: z.string().optional(),
            text: z.string().min(1, "Item text cannot be empty"),
            completed: z.boolean().default(false)
        }))
    })).optional().default([]),
    drawings: z.array(z.object({
        _id: z.string().optional(),
        title: z.string().optional().default(""),
        data: z.string().optional().default("[]")
    })).optional().default([]),
}).strict();  // strict() method ensures that the object being validated does not contain any additional properties that are not defined in the schema. If any extra properties are present, the validation will fail.

const updateNoteSchema = noteSchema.partial().strict();

const noteQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
    sort: z.enum(["latest", "oldest"]).default("latest"),
}).strict();

export default noteSchema;
export { updateNoteSchema, noteQuerySchema };