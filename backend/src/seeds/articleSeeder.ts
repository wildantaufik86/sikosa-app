import mongoose from "mongoose";
import ArticleModel from "../models/articleModel";
import UserModel from "../models/userModel";
import connectToDatabase from "../config/db";

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const articleData = [
  {
    title: "Mengenal Gejala Kecemasan pada Mahasiswa dan Cara Mengatasinya",
    content: `Kecemasan adalah respons alami tubuh terhadap situasi yang menekan. Namun bagi mahasiswa, tekanan akademik, sosial, dan finansial yang bersamaan dapat membuat kecemasan berkembang menjadi gangguan yang mengganggu kehidupan sehari-hari.

Gejala kecemasan yang umum dialami mahasiswa meliputi: kesulitan berkonsentrasi saat belajar, gangguan tidur, jantung berdebar sebelum ujian, menghindari situasi sosial, serta pikiran berulang tentang kegagalan.

Cara mengatasi kecemasan secara mandiri antara lain:
- Teknik pernapasan dalam (deep breathing) selama 5 menit
- Journaling harian untuk mengekspresikan perasaan
- Olahraga ringan minimal 30 menit per hari
- Menjaga pola tidur yang konsisten
- Berbicara dengan orang yang dipercaya

Jika gejala berlanjut lebih dari dua minggu dan mengganggu fungsi akademik, segera konsultasikan dengan psikolog.`,
    thumbnail: "",
  },
  {
    title: "Strategi Manajemen Stres untuk Menghadapi Tekanan Akademik",
    content: `Tekanan akademik adalah salah satu penyebab stres terbesar bagi mahasiswa. Deadline tugas, persiapan ujian, dan ekspektasi tinggi dari keluarga dapat menciptakan beban mental yang signifikan.

Manajemen stres bukan berarti menghilangkan stres sepenuhnya, melainkan mengelolanya agar tidak merusak kesehatan dan produktivitas.

Strategi efektif yang bisa diterapkan:

**1. Time Blocking**
Bagi waktu belajar menjadi blok-blok 25 menit (teknik Pomodoro) dengan istirahat 5 menit di antaranya. Ini membantu otak tetap fokus tanpa kelelahan berlebihan.

**2. Prioritasi Tugas**
Gunakan matriks Eisenhower: bedakan mana yang penting-mendesak, penting-tidak mendesak, tidak penting-mendesak, dan tidak penting-tidak mendesak.

**3. Self-compassion**
Berlatihlah untuk tidak terlalu keras pada diri sendiri. Kesalahan adalah bagian dari proses belajar.

**4. Istirahat Berkualitas**
Tidur 7-8 jam per malam bukan pemborosan waktu, melainkan investasi untuk performa kognitif yang optimal.`,
    thumbnail: "",
  },
  {
    title: "Pentingnya Kesehatan Mental bagi Prestasi Akademik Mahasiswa",
    content: `Penelitian menunjukkan bahwa kesehatan mental yang baik berkorelasi langsung dengan prestasi akademik. Mahasiswa yang secara mental sehat cenderung memiliki kemampuan belajar, memori, dan pemecahan masalah yang lebih baik.

Sayangnya, stigma seputar kesehatan mental masih menjadi hambatan bagi banyak mahasiswa untuk mencari bantuan. Banyak yang merasa bahwa mengakui masalah mental adalah tanda kelemahan.

Faktanya: mencari bantuan adalah tanda kekuatan dan kesadaran diri.

Tanda-tanda kesehatan mental yang baik:
- Mampu mengelola emosi dengan efektif
- Memiliki hubungan sosial yang sehat
- Dapat mengatasi tantangan dan bangkit dari kegagalan
- Merasa terhubung dengan tujuan hidup
- Tidur dan makan dengan pola yang teratur

Institusi pendidikan memiliki tanggung jawab untuk menyediakan layanan kesehatan mental yang mudah diakses. Jika kampus kamu memiliki layanan konseling, manfaatkan sebaik mungkin.`,
    thumbnail: "",
  },
  {
    title: "Cara Membangun Rutinitas Harian yang Mendukung Kesehatan Mental",
    content: `Rutinitas yang terstruktur adalah fondasi kesehatan mental yang sering diabaikan. Otak manusia menyukai prediktabilitas — ketika kita memiliki rutinitas yang konsisten, sistem saraf kita berada dalam kondisi lebih tenang dan siap berfungsi optimal.

Komponen rutinitas harian yang sehat untuk mahasiswa:

**Pagi hari**
Mulai hari tanpa langsung membuka media sosial. Luangkan 10 menit untuk stretching atau meditasi singkat. Sarapan bergizi menyiapkan energi otak untuk belajar.

**Siang hari**
Jadwalkan waktu belajar di saat energi paling tinggi (biasanya pukul 10.00-12.00). Hindari belajar saat mengantuk karena kontraproduktif.

**Sore hari**
Sisihkan waktu untuk aktivitas fisik atau hobi. Ini bukan pemborosan waktu — ini recharging.

**Malam hari**
Buat daftar prioritas untuk esok hari. Hindari layar minimal 30 menit sebelum tidur. Tidur di jam yang sama setiap hari mengoptimalkan kualitas istirahat.

Konsistensi lebih penting dari kesempurnaan. Mulai dari perubahan kecil dan bangun secara bertahap.`,
    thumbnail: "",
  },
];

export async function seedArticles(fresh = false) {
  const psikolog = await UserModel.findOne({ role: "psikolog" });
  if (!psikolog) {
    console.warn("  No psikolog found. Run userSeeder first.");
    return;
  }

  if (fresh) {
    await ArticleModel.deleteMany({});
    console.log("  Articles collection cleared");
  }

  for (const data of articleData) {
    const slug = toSlug(data.title);
    const existing = await ArticleModel.findOne({ slug });
    if (existing) {
      console.log(`  Skipped (exists): ${slug}`);
      continue;
    }

    await ArticleModel.create({
      ...data,
      slug,
      writer: psikolog._id,
    });
    console.log(`  Seeded article: ${data.title.substring(0, 50)}...`);
  }
}

// Run standalone: ts-node -r dotenv/config src/seeds/articleSeeder.ts
if (require.main === module) {
  const fresh = process.argv.includes("--fresh");
  connectToDatabase()
    .then(() => seedArticles(fresh))
    .then(() => {
      console.log("Article seeding complete");
      mongoose.disconnect();
    })
    .catch((err) => {
      console.error("Article seeding failed:", err);
      mongoose.disconnect();
      process.exit(1);
    });
}
