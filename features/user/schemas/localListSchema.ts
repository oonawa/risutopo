import { z } from "zod";
import { listItemSchema } from "@/features/shared/schemas/listItemSchema";

export const localListItemsSchema = z.array(listItemSchema);

export const localSubListSchema = z.object({
	subListId: z.uuid(),
	name: z.string(),
	listItemIds: z.array(z.uuid()),
});

export const localListSchema = z.object({
	listId: z.uuid(),
	items: localListItemsSchema,
	subLists: z.array(localSubListSchema),
});

export type LocalListItems = z.infer<typeof localListItemsSchema>;
export type LocalList = z.infer<typeof localListSchema>;
export type LocalSubList = z.infer<typeof localSubListSchema>;
