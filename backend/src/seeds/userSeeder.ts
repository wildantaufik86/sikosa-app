import mongoose from "mongoose";
import UserModel from "../models/userModel";
import connectToDatabase from "../config/db";

const users = [
  {
    email: "admin@sikosa.com",
    password: "Admin@123",
    role: "admin" as const,
    verified: true,
    profile: {
      fullname: "Admin Sikosa",
      picture: "",
      description: "Administrator sistem Sikosa",
    },
  },
  {
    email: "dr.rina@sikosa.com",
    password: "Psikolog@123",
    role: "psikolog" as const,
    verified: true,
    profile: {
      fullname: "Dr. Rina Kusuma, M.Psi",
      picture: "",
      description:
        "Psikolog klinis dengan pengalaman lebih dari 10 tahun dalam bidang kesehatan mental mahasiswa.",
      specialization: "Kecemasan & Depresi",
      educationBackground: [
        "S1 Psikologi - Universitas Indonesia",
        "S2 Psikologi Klinis - Universitas Gadjah Mada",
        "Profesi Psikolog - HIMPSI",
      ],
    },
  },
  {
    email: "budi.santoso@sikosa.com",
    password: "Psikolog@123",
    role: "psikolog" as const,
    verified: true,
    profile: {
      fullname: "Budi Santoso, M.Psi",
      picture: "",
      description:
        "Spesialis dalam konseling akademik dan pengembangan diri mahasiswa.",
      specialization: "Konseling Akademik & Manajemen Stres",
      educationBackground: [
        "S1 Psikologi - Universitas Airlangga",
        "S2 Psikologi Pendidikan - Universitas Negeri Malang",
      ],
    },
  },
  {
    email: "andi.mahasiswa@student.sikosa.com",
    password: "Mahasiswa@123",
    nim: "2021001001",
    role: "mahasiswa" as const,
    verified: true,
    profile: {
      fullname: "Andi Pratama",
      picture: "",
    },
  },
  {
    email: "sari.mahasiswa@student.sikosa.com",
    password: "Mahasiswa@123",
    nim: "2021001002",
    role: "mahasiswa" as const,
    verified: true,
    profile: {
      fullname: "Sari Dewi",
      picture: "",
    },
  },
  {
    email: "rizki.mahasiswa@student.sikosa.com",
    password: "Mahasiswa@123",
    nim: "2021001003",
    role: "mahasiswa" as const,
    verified: true,
    profile: {
      fullname: "Rizki Ramadhan",
      picture: "",
    },
  },
];

export async function seedUsers(fresh = false) {
  if (fresh) {
    await UserModel.deleteMany({});
    console.log("  Users collection cleared");
  }

  for (const userData of users) {
    const existing = await UserModel.findOne({ email: userData.email });
    if (existing) {
      console.log(`  Skipped (exists): ${userData.email}`);
      continue;
    }

    const user = new UserModel(userData);
    await user.save();
    console.log(`  Seeded: ${userData.email} [${userData.role}]`);
  }
}

// Run standalone: ts-node -r dotenv/config src/seeds/userSeeder.ts
if (require.main === module) {
  const fresh = process.argv.includes("--fresh");
  connectToDatabase()
    .then(() => seedUsers(fresh))
    .then(() => {
      console.log("User seeding complete");
      mongoose.disconnect();
    })
    .catch((err) => {
      console.error("User seeding failed:", err);
      mongoose.disconnect();
      process.exit(1);
    });
}
