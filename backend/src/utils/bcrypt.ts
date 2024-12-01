import bcrypt from "bcrypt";

export const hashValue = async (value: string, saltRounds?: number) =>
  bcrypt.hash(value, saltRounds || 10);

export const compareValue = async (value: string, hashRounds?: number) =>
  bcrypt.hash(value, hashRounds || 10).catch(() => false);
