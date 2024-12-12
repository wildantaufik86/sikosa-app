import bcrypt from "bcrypt";

export const hashValue = async (value: string, saltRounds?: number) =>
  bcrypt.hash(value, saltRounds || 10);

export const compareValue = async (value: string, hashedValue?: string) => {
  if (!hashedValue) return false;
  return bcrypt.compare(value, hashedValue);
};
