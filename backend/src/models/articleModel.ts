import mongoose from "mongoose";

export interface ArticleDocument extends Document {
  writer_id: mongoose.Schema.Types.ObjectId;
  thumbnail: string;
  title: string;
  content: string;
  slug: string;
}

const articleSchema = new mongoose.Schema<ArticleDocument>(
  {
    writer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    thumbnail: { type: String, default: "" },
    title: { type: String, required: true },
    content: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const ArticleModel = mongoose.model<ArticleDocument>("Article", articleSchema);
export default ArticleModel;
