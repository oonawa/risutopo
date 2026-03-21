import { z } from "zod";
import { listItemSchema } from "@/features/shared/schemas/listItemSchema";

export const localListItemsSchema = z.array(listItemSchema);

export const localListSchema = z.object({
	listId: z.uuid(),
	items: localListItemsSchema,
});

export type LocalListItems = z.infer<typeof localListItemsSchema>;
export type LocalList = z.infer<typeof localListSchema>;
