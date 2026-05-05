import { atom } from "jotai";

export const deviceTabAtom = atom<"pc" | "mobile" | undefined>(undefined);
