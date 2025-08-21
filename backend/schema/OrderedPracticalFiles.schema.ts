import mongoose from "mongoose";

const orderedPracticalFilesSchema = new mongoose.Schema(
  {
    ref_FileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PracticalFiles",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SignUp",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    deletedByUser: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const OrderedPracticalFiles = mongoose.model(
  "OrderedPracticalFile",
  orderedPracticalFilesSchema
);

export default OrderedPracticalFiles;
