import multer from "multer";
import path from "path";
import { Request } from "express";
import crypto, { randomBytes } from "crypto";

// Konfigurasi multer untuk menyimpan file di folder uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); // Folder tujuan
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString("hex")}`; // Tambahkan timestamp + randomBytes
    const ext = path.extname(file.originalname); // Ekstensi file asli
    const name = path.basename(file.originalname, ext); // Nama file tanpa ekstensi
    cb(null, `${name}-${uniqueSuffix}${ext}`); // Format nama: nama-timestamp-random.ext
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // File diterima
    } else {
      cb(null, false); // Tolak file
      return cb(new Error("Only images are allowed")); // Tambahkan Error untuk log
    }
  },
});

export default upload;
