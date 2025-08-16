import { useState } from "react";
import { User, Lock, Briefcase, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PrinteryButton from "../components/PrinteryButton";
export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    admissionNo: "",
    department: "",
    year: "",
    password: "",
    confirmPassword: "",
  });

  const [userCreated, setUserCreated] = useState(false);

  const [hasCapitalLetter, setHasCapitalLetter] = useState(false);

  const [admissionNoLength, setAdmissionNoLength] = useState(false);

  const [passwordLength, setPasswordLength] = useState(false);

  const [showUserAlreadyExists, setShowUserAlreadyExists] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "admissionNo") {
      const containsUpperCase = /[A-Z]/.test(value);

      setHasCapitalLetter(containsUpperCase);
    }
    if (
      name === "admissionNo" &&
      (value.length > 13 || value.length < 13) &&
      value.length !== 0
    ) {
      setAdmissionNoLength(true);
    }
    if (name === "admissionNo" && value.length === 13) {
      setAdmissionNoLength(false);
    }
    if (name === "admissionNo" && value.length > 13) {
      setHasCapitalLetter(false);
    }

    if (name === "password" && value.length < 8 && value.length !== 0) {
      setPasswordLength(true);
    }
    if (value.length === 8 || value.length > 8) {
      setPasswordLength(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement | HTMLSelectElement>
  ) => {
    e.preventDefault();
    try {
      const signupData = await fetch("http://localhost:3000/auth/sign-up", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (signupData.ok) {
        console.log("successfull");
        setUserCreated(true);
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        setShowUserAlreadyExists(true);
      }
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 rounded-xl w-full max-w-md bg-white  text-black">
        <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-500  to-blue-800 bg-clip-text text-transparent">
          Welcome to Printery
        </h2>
        <p className="text-center text-black mb-6">
          Now no need to struggle in the crowd
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admission No */}
          <div>
            <label
              htmlFor="admissionNo"
              className="block text-sm font-medium mb-1"
            >
              Admission No.
            </label>

            <div className="flex items-center">
              <User className="w-5 h-5 absolute ml-2 text-gray-700" />
              <input
                type="text"
                name="admissionNo"
                value={formData.admissionNo}
                onChange={handleChange}
                required
                className="w-full pl-8 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-gray-500"
                placeholder="2024b02310092"
              />
            </div>
            {hasCapitalLetter && (
              <p className="text-red-500">
                Admission no. should be in lowercase
              </p>
            )}
            {admissionNoLength && (
              <p className="text-red-500 ">
                Admission no. should be 13 characters long
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium mb-1"
            >
              Department
            </label>
            <div className="flex items-center">
              <Briefcase className="w-5 h-5 absolute ml-2 text-gray-700" />
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className={`w-full pl-8 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                  formData.department === "" ? "text-gray-500" : "text-black"
                }`}
              >
                <option value="">Select Department</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">Mechanical</option>
                <option value="CE">Civil</option>
                <option value="EE">Electrical</option>
              </select>
            </div>
          </div>

          {/* Year */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium mb-1">
              Year
            </label>
            <div className="flex items-center ">
              <Calendar className="w-5 h-5 absolute ml-2 text-gray-700" />
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className={`w-full pl-8 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                  formData.year === "" ? "text-gray-500" : "text-black"
                }`}
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <div className="flex items-center">
              <Lock className="w-5 h-5 absolute ml-2 text-gray-700" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-8 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Choose password"
              />
            </div>

            {passwordLength && (
              <p className="text-red-500  ">
                Password should be at least 8 characters long
              </p>
            )}
          </div>
          {showUserAlreadyExists &&
            (userCreated ? (
              <p className="text-green-500 text-center text-xl ">
                User created successfully
              </p>
            ) : (
              <p className="text-red-500 text-center text-xl ">
                User already exists
              </p>
            ))}

          {/* Submit */}
          <PrinteryButton innerText="Create Account" />
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
