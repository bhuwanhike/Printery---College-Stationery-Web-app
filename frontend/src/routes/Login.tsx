import { useState } from "react";
import { User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PrinteryButton from "../components/PrinteryButton";

export default function Login() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);

  const [formData, setFormData] = useState({
    admissionNo: "",
    password: "",
    admin_username: "",
  });

  const [userNotFound, setUserNotFound] = useState(false);
  const navigate = useNavigate();
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  const [hasCapitalLetter, setHasCapitalLetter] = useState(false);

  const [admissionNoLength, setAdmissionNoLength] = useState(false);

  const [containSpecialCharacter, setContainSpecialCharacter] = useState(false);

  const [passwordLength, setPasswordLength] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "admissionNo") {
      const containsUpperCase = /[A-Z]/.test(value);

      setHasCapitalLetter(containsUpperCase);

      const containsSpecialCharater = /[^A-Za-z0-9]/.test(value);
      setContainSpecialCharacter(containsSpecialCharater);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const loginData = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const res = await loginData.json();

      if (!loginData.ok) {
        setUserLoggedIn(false);
        setUserNotFound(true);
        return;
      }

      setUserLoggedIn(true);
      setUserNotFound(false);
      // console.log(res);

      setTimeout(() => {
        if (res.isAdmin) {
          navigate("/admin/dashboard");
        }
        if (!res.isAdmin) {
          navigate("/dashboard");
        }
      }, 50);
    } catch (error) {
      console.error("Error logging in:", error);
      setUserNotFound(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div
        className={`p-8 rounded-xl xs:w-[90%] 2xs:w-[80vw] xsl:w-[80vw] nsl:w-[70vw] md:w-[60vw] lg:w-[50vw] 2lg:w-[40vw] xl:max-w-[40vw] nxl:max-w-[35vw] 2xl:max-w-[30vw] bg-white  text-black ${
          isAdmin || isUser
            ? ""
            : "!bg-[#0b112d]/70 !rounded-2xl !p-8   !shadow-lg !border !border-[#1b254b]"
        }`}
      >
        <h2
          className={`xs:text-[40px] 2xs:text-[30px] text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-500  to-blue-800 bg-clip-text text-transparent ${
            !isAdmin && !isUser ? "text-white" : ""
          }`}
        >
          {isAdmin ? "Login" : "Sign in"}
        </h2>
        {isUser && (
          <p className="xs:text-[20px] 2xs:text-[18px] text-center text-black mb-6">
            Welcome back! Please sign in to continue
          </p>
        )}

        {(isAdmin || isUser) && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 xs:text-[20px] 2xs:text-[18px] sm:text-xl md:px-5"
          >
            {/* Admission No */}
            {isUser ? (
              <div>
                <label className="xs:text-[20px] 2xs:text-[18px] sm:text-xl block text-sm font-medium mb-1 text-gray-800">
                  Admission No.
                </label>
                <div className="flex items-center">
                  <User className="w-5 h-5 absolute ml-2 text-black" />
                  <input
                    type="text"
                    name="admissionNo"
                    value={formData.admissionNo}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full pl-9 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
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
                {containSpecialCharacter && (
                  <p className="text-red-500 ">
                    Admission no. cannot contain special characters
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="xs:text-[20px] 2xs:text-[18px] sm:text-xl block text-sm font-medium mb-1 text-gray-800">
                  Admin username
                </label>
                <div className="flex items-center">
                  <User className="w-5 h-5 absolute ml-2 text-black" />
                  <input
                    type="text"
                    name="admin_username"
                    value={formData.admin_username}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full pl-9 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Admin username"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="xs:text-[20px] 2xs:text-[18px] sm:text-xl block text-sm font-medium mb-1 text-gray-800">
                Password
              </label>
              <div className="flex items-center">
                <Lock className="w-5 h-5 absolute ml-2 text-black" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="relative w-full pl-9 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder={isUser ? "Enter password" : "Admin password"}
                />
              </div>
              {passwordLength && (
                <p className="text-red-500  ">
                  Password should be at least 8 characters long
                </p>
              )}
            </div>

            {userNotFound &&
              (userLoggedIn ? (
                <p className="text-green-500 text-center text-xl ">
                  User logged in successfully
                </p>
              ) : (
                <p className="text-red-500 text-center text-xl ">
                  User not found
                </p>
              ))}

            {/* Submit */}
            {(isAdmin || isUser) && (
              <PrinteryButton innerText={isAdmin ? "Login" : "Sign in"} />
            )}
          </form>
        )}

        {isUser && (
          <p className="xs:text-[20px] 2xs:text-[18px] mt-4 text-center text-sm">
            Don’t have an account?{" "}
            <a href="/sign-up" className="!text-purple-600 hover:underline">
              Create one
            </a>
          </p>
        )}

        {!isAdmin && !isUser && (
          <div className="userType   flex xs:flex-col xs:text-[22px] 2xs:text-[18px] 2xs:gap-6 xxs:px-10 xsl:flex-row xsl:px-0 items-center justify-around mt-10">
            <button
              className=" xs:w-full xsl:w-1/2 !bg-blue-500 !font-bold hover:!bg-blue-800"
              onClick={() => setIsUser(true)}
            >
              User login
            </button>
            <button
              className=" xs:w-full xsl:w-1/2 !bg-pink-600 !font-bold hover:!bg-pink-800"
              onClick={() => setIsAdmin(true)}
            >
              Admin login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
