import { z } from "zod";

export const registerLocalListPayloadSchema = z.object({
	listId: z.uuid(),
	items: z.array(z.unknown()),
});

export type RegisterLocalListInput = z.infer<
	typeof registerLocalListPayloadSchema
>;
