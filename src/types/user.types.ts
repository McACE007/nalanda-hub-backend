export type Role = "USER" | "MOD" | "ADMIN";

export type User = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
};
