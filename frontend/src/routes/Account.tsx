import React, { useEffect, useState } from "react";
import {
  User,
  Lock,
  Building,
  GraduationCap,
  LogOut,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { useUser } from "../context/useUser";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

interface UserData {
  admissionNo: string;
  department: string;
  year: number;
  isAdmin: boolean;
}

const Account: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    admissionNo: "",
    department: "",
    year: 0,
    isAdmin: false,
  });
  const { userID, fetchAdmissionNo } = useUser();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchUserInfo = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/settings/${userID}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      setUserData(data.user);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  useEffect(() => {
    fetchAdmissionNo();
    if (!userID || userID === "null") return; // extra safety
    fetchUserInfo();
  }, [userID, fetchAdmissionNo]);

  useEffect(() => {
    if (userID) fetchUserInfo();
  }, [userID]); // runs again when userID updates

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserData>(userData);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const departments = ["CSE", "ECE", "ME", "CE", "EE"];
  const years = [1, 2, 3, 4];

  const handleSaveProfile = async () => {
    // API call to update user profile
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/settings/${userID}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editData),
    });
    // const data = await res.json();
    setUserData(editData);
    setIsEditing(false);
    // Show success message
    alert("Profile updated successfully!");
  };

  const handleCancelEdit = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    // API call to change password
    await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/settings/change-password/${userID}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      }
    );
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordForm(false);
    alert("Password changed successfully!");
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/settings/${userID}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Account deleted successfully!");
        logout();
        navigate("/sign-up");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account");
    }
  };

  useEffect(() => {
    if (showDeleteConfirm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showDeleteConfirm]);

  return (
    <div
      className={`xs:min-w-[95%] xs:my-[10vh] 2xs:my-[12vh]  xsm:my-[12vh] nsl:my-[16vh] nsl:min-w-[85%] sm:min-w-[80%] sm:!p-12  md:min-w-[75%] md:my-45 xl:my-50  mx-auto bg-[#0b112d] w-[70%] h-full rounded-2xl xs:p-8 shadow-lg border border-[#1b254b] px-20 flex flex-col items-center justify-center xs:gap-15 gap-20 2xl:my-60`}
    >
      <div className="xs:p-0 py-10 px-10 w-full">
        <p className="xs:text-[19px] xsm:text-[24px] lg:text-3xl xl:text-3xl 2xl:text-4xl font-bold text-white">
          Account Settings
        </p>

        <hr className="xs:w-full xs:my-2 md:my-3 xsm:my-1 border-1 border-transparent xs:h-[3px] h-1 xs:min-w-[75vw]  bg-gradient-to-r from-red-600 to-blue-600 sm:min-w-[90%] md:min-w-[62vw]" />

        {/* Single Card Container */}
        {userID ? (
          <div className="mt-8 xs:mt-12 xxs:mt-20 lg:px-10 xl:px-15 nxl:px-25">
            <div className="flex flex-col gap-6 xs:gap-8 xxs:gap-12">
              {/*Profile Information */}
              <div className="space-y-6 xs:space-y-8 px-4 xs:px-6 xxs:px-8 xsm:px-12 sm:px-16 md:px-20 lg:px-30 py-6 xs:py-8 xxs:py-10 bg-slate-800/30 backdrop-blur-sm border border-blue-400/50 rounded-lg">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4 xs:gap-4 ">
                  <h2 className="text-lg xs:text-xl xxs:text-2xl font-semibold text-white flex items-center gap-2 xs:gap-3">
                    <User className="text-blue-400" size={20} />
                    Profile
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-3 xs:!px-2 lg:!px-4 py-2 !bg-blue-600/80 hover:!bg-blue-600 text-white rounded-md transition-colors border !border-blue-500/50 text-sm xs:text-base"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                  ) : (
                    <div className="flex xs:flex-col lg:flex-row gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 px-3  xs:!px-2 xl:!px-4 py-2 !bg-green-600/80 hover:!bg-green-600 text-white rounded-md transition-colors border !border-green-500/50 text-sm xs:text-base"
                      >
                        <Save size={14} />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-3 xs:!px-2 xl:!px-4 py-2 !bg-gray-600/80 hover:!bg-gray-600 text-white rounded-md transition-colors border !border-gray-500/50 text-sm xs:text-base"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <form className="space-y-4 xs:space-y-6 xs:text-[20px]">
                  {/* Admission Number */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-2">
                      Admission no.
                    </label>
                    <input
                      type="text"
                      value={
                        isEditing ? editData.admissionNo : userData.admissionNo
                      }
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          admissionNo: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      className="w-full px-3 xs:px-4 py-2 xs:py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-2">
                      Department
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.department}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            department: e.target.value,
                          })
                        }
                        className="w-full px-3 xs:px-4 py-2 xs:py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-sm xs:text-base"
                      >
                        {departments.map((dept) => (
                          <option
                            key={dept}
                            value={dept}
                            className="bg-slate-700"
                          >
                            {dept}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2 xs:py-3 bg-slate-700/30 border border-slate-600 rounded-md">
                        <Building className="text-blue-400" size={18} />
                        <span className="text-white text-sm xs:text-base">
                          {userData.department}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-2">
                      Year
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.year}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            year: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 xs:px-4 py-2 xs:py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-sm xs:text-base"
                      >
                        {years.map((year) => (
                          <option
                            key={year}
                            value={year}
                            className="bg-slate-700"
                          >
                            Year {year}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2 xs:py-3 bg-slate-700/30 border border-slate-600 rounded-md">
                        <GraduationCap className="text-blue-400" size={18} />
                        <span className="text-white text-sm xs:text-base">
                          Year {userData.year}
                        </span>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Security Section */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-blue-400/50 rounded-lg px-4 xs:px-6 xxs:px-8 xsm:px-12 sm:px-16 md:px-20 lg:px-30 py-6 xs:py-8 xxs:py-10">
                <h3 className="text-lg xs:text-xl xxs:text-2xl font-semibold text-white mb-4 xs:mb-6 flex items-center gap-2 xs:gap-3">
                  <Lock className="text-blue-400" size={20} />
                  Security
                </h3>

                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full px-3 xs:px-4 py-2 xs:py-3 !bg-slate-700/50 hover:!bg-slate-600/50 text-white rounded-md transition-colors border !border-slate-600 text-sm xs:text-base"
                  >
                    Change Password
                  </button>
                ) : (
                  <div className="space-y-3 xs:space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 xs:px-4 py-2 xs:py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 pr-10 text-sm xs:text-base"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              current: !showPasswords.current,
                            })
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.current ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 xs:px-4 py-2 xs:py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 pr-10 text-sm xs:text-base"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              new: !showPasswords.new,
                            })
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.new ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 xs:px-4 py-2 xs:py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 pr-10 text-sm xs:text-base"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm,
                            })
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex xs:flex-col  gap-3 pt-2">
                      <button
                        onClick={handlePasswordChange}
                        className="flex-1 px-3 xs:px-4 py-2 xs:py-3 !bg-blue-600/80 hover:!bg-blue-600 text-white rounded-md transition-colors border !border-blue-500/50 text-sm xs:text-base"
                      >
                        Update Password
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        className="flex-1 px-3 xs:px-4 py-2 xs:py-3 !bg-gray-600/80 hover:!bg-gray-600 text-white rounded-md transition-colors border !border-gray-500/50 text-sm xs:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Actions Section */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-red-600/50 rounded-lg px-4 xs:px-6 xxs:px-8 xsm:px-12 sm:px-16 md:px-20 lg:px-30 py-6 xs:py-8 xxs:py-10">
                <h3 className="text-lg xs:text-xl xxs:text-2xl font-semibold text-white mb-4 xs:mb-6">
                  Account Actions
                </h3>
                <div className="flex xs:flex-col justify-between gap-4 xs:gap-6 lg:flex-row">
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="w-full xs:w-[100%]  px-3 xs:px-4 py-2 xs:py-3 lg:!px-2 lg:!py-4 !bg-red-600/50 hover:!bg-red-800 text-white rounded-md transition-colors flex items-center justify-center gap-2 border !border-red-600/50 text-sm xs:text-base"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full xs:w-[100%] px-3 xs:px-4 py-2 xs:py-3 lg:!px-2 lg:!py-4 !bg-slate-700/50 hover:!bg-slate-600/50 text-white rounded-md transition-colors flex items-center justify-center gap-2 border !border-red-500/50 text-sm xs:text-base"
                  >
                    <Trash2 size={18} color="red" />
                    <span className="text-red-600">Delete Account</span>
                  </button>
                </div>
              </div>

              {/* Delete Confirmation Modal */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
                  <div className="bg-[#0b112d] border border-red-500/50 rounded-2xl shadow-lg w-full max-w-sm xs:max-w-md p-4 xs:p-6">
                    <h2 className="text-lg xs:text-xl font-semibold text-white mb-3 xs:mb-4">
                      Confirm Account Deletion
                    </h2>
                    <p className="text-gray-300 mb-4 xs:mb-6 text-sm xs:text-base">
                      Are you sure you want to delete your account? This action
                      cannot be undone.
                    </p>
                    <div className="flex flex-col xs:flex-row justify-end gap-2 xs:gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 xs:px-4 py-2 !bg-gray-600/80 hover:!bg-gray-600 text-white rounded-md border !border-gray-500/50 text-sm xs:text-base order-2 xs:order-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteAccount();
                          setShowDeleteConfirm(false);
                          logout();
                          navigate("/sign-up");
                        }}
                        className="px-3 xs:px-4 py-2 !bg-red-600/80 hover:!bg-red-700 text-white rounded-md border !border-red-500/50 text-sm xs:text-base order-1 xs:order-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-white text-center text-sm xs:text-base">
            Loading account...
          </p>
        )}
      </div>
    </div>
  );
};

export default Account;
