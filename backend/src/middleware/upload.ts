import multer from "multer";
import path from "path";
import crypto, { randomBytes } from "crypto";

// Konfigurasi multer untuk menyimpan file di folder uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads")); // Folder tujuan
  },
  filename: (req, file, cb) => {
    // Tambahkan ekstensi dengan pasti
    const uniqueFileName = `${crypto
      .randomBytes(16)
      .toString("hex")}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
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
