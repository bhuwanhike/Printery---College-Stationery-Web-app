import mongoose, { Document, Types } from "mongoose";

export interface IFile extends Document {
  userId: Types.ObjectId; // Reference to SignUp._id
  filename: string;
  url: string;
  isColored: boolean;
  amount: number;
  qty: number;
  hash: string;
  deletedByUser: boolean;
  status: string;
  publicId: string;
}

const uploadFilesSchema = new mongoose.Schema<IFile>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SignUp",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    isColored: {
      type: Boolean,
      required: true,
    },
    amount: {
      type: Number,
      default: 3,
    },

    qty: {
      type: Number,
      required: true,
    },
    hash: { type: String, required: true },

    deletedByUser: {
      type: Boolean,
      required: true,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
delete mongoose.models.UploadFiles;
const UploadFiles = mongoose.model<IFile>("UploadFiles", uploadFilesSchema);

export default UploadFiles;
