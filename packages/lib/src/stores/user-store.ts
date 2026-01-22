import { create } from "zustand";
import { Schema } from "../api/types/schema/schema-parser";

type UserStore = {
  user: Schema<"UserResponseDto"> | null;
  setUser: (user: Schema<"UserResponseDto"> | null) => void;
};

export const useUserStore = create<UserStore>()((set) => ({
  user: null,
  setUser: (user: Schema<"UserResponseDto"> | null) => set({ user }),
}));
