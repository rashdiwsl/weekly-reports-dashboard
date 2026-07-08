import api from "./api";
import { User } from "./auth";

export async function getAllUsers(): Promise<User[]> {
  const res = await api.get("/auth/users");
  return res.data;
}