import mongoose from "mongoose";

const helpSchema = new mongoose.Schema(
  {
    ref_userId: {
      type: String,
      required: true,
    },
    admissionNo: {
      type: String,
      required: true,
      match: [
        /^[A-Za-z0-9]+$/i,
        "Admission number must contain only letters and numbers",
      ],
      minlength: [13, "Admission No. must be 13 characters long"],
      maxlength: [13, "Admission No. must be 13 characters long"],
      trim: true,
    },

    email: {
      type: String,
      required: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    deletedByUser: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

const Help = mongoose.model("Help", helpSchema);

export default Help;
