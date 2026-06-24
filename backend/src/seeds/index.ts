import mongoose from "mongoose";
import connectToDatabase from "../config/db";
import { seedUsers } from "./userSeeder";
import { seedArticles } from "./articleSeeder";

async function runSeeders() {
  const fresh = process.argv.includes("--fresh");

  console.log(`\n=== Sikosa Database Seeder ===`);
  console.log(`Mode: ${fresh ? "FRESH (drop + re-seed)" : "Idempotent (skip existing)"}\n`);

  await connectToDatabase();

  console.log("[1/2] Seeding users...");
  await seedUsers(fresh);

  console.log("\n[2/2] Seeding articles...");
  await seedArticles(fresh);

  console.log("\n=== Seeding complete ===\n");
  mongoose.disconnect();
}

runSeeders().catch((err) => {
  console.error("Seeding failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
