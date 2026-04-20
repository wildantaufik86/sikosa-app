import { RequestHandler } from "express";
import { BAD_REQUEST, OK } from "../constants/http";
import { updatePsychologistProfile } from "../services/psychologist.service";

export const updatePsychologistProfileHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    const { fullname, description, specialization, educationBackground } = req.body;

    const picture = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (
      fullname === undefined &&
      picture === undefined &&
      description === undefined &&
      specialization === undefined &&
      educationBackground === undefined
    ) {
      return res.status(400).json({
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

    res.status(200).json({
      message: "Psychologist profile updated successfully",
      data: profile,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};
