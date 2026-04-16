import { RequestHandler } from "express";
import { BAD_REQUEST, OK } from "../constants/http";
import { updatePsychologistProfile } from "../services/psychologist.service";

export const updatePsychologistProfileHandler: RequestHandler = async (
  req,
  res
) => {
  const userId = req.userId; // Middleware authenticate
  const { fullname, description, specialization, educationBackground } =
    req.body;

  // Handle upload file picture
  const picture = req.file
    ? `/uploads/${req.file.filename}` // Relative path untuk akses gambar
    : undefined;

  if (!fullname && !picture && !description && !educationBackground) {
    return res.status(BAD_REQUEST).json({
      message: "No valid fields to update",
    });
  }

  const profile = await updatePsychologistProfile({
    userId,
    fullname,
    description,
    specialization,
    educationBackground,
    picture,
  });

  res.status(OK).json({
    message: "Psychologist profile updated successfully",
    data: profile,
  });
};
