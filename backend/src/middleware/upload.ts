import multer from "multer";
import path from "path";
import { Request, Response } from "express";

// Konfigurasi multer untuk menyimpan file di folder uploads
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    cb(null, path.join(__dirname, "../uploads")); // folder penyimpanan
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maks 2MB
});

export default upload;
