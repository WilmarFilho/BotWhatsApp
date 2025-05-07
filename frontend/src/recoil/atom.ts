// src/store/userAtom.ts
import { atom } from "recoil";
import User from "../types/User";


export const userState = atom<User | null>({
  key: "user",
  default: null,
});

export const tokenState = atom<string | null>({
  key: "token",
  default: null,
});
