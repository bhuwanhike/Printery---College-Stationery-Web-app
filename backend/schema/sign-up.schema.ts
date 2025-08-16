import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  admissionNo: string;
  department: string;
  year: number;
  password: string;
  generateToken: () => string;
  comparePassword: (password: string) => Promise<boolean>;
  isAdmin: boolean;
}

const signUpSchema = new mongoose.Schema<IUser>(
  {
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
    department: {
      type: String,
      required: true,
      enum: ["CSE", "ECE", "ME", "CE", "EE"],
      message: "Department must be one of CSE, ECE, ME, CE, or EE",
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4],
      message: "Year must be between 1 and 4",
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

signUpSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  try {
    const hashPassword = await bcrypt.hash(this.password, 10);
    this.password = hashPassword;
  } catch (error) {
    next(error as Error);
  }
});

signUpSchema.index(
  { admissionNo: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

signUpSchema.methods.comparePassword = async function (password: string) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

signUpSchema.methods.generateToken = function () {
  try {
    const token = jwt.sign(
      {
        userId: this._id.toString(),
        admissionNo: this.admissionNo,
        isAdmin: this.isAdmin,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );
    return token;
  } catch (error) {
    console.log("Error generating token", error);
    throw new Error("Token generation failed");
  }
};

const SignUp = mongoose.model<IUser>("SignUp", signUpSchema);
export default SignUp;
