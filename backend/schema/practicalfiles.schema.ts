import mongoose from "mongoose";

const practicalFilesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      enum: {
        values: [1, 2, 3, 4],
        message: "Year must be between 1 and 4",
      },
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    subject_code: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PracticalFiles = mongoose.model("Practicalfile", practicalFilesSchema);

export default PracticalFiles;
