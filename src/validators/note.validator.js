import { z } from "zod";

const noteSchema = z.object({

    title: z.string().min(1),
    description: z.string().min(1),
    
}).strict();  // strict() method ensures that the object being validated does not contain any additional properties that are not defined in the schema. If any extra properties are present, the validation will fail.

const updateNoteSchema = noteSchema.partial().strict();

export default noteSchema;
export { updateNoteSchema };