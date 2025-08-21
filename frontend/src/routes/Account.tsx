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
      const res = await fetch(`http://localhost:3000/settings/${userID}`, {
        method: "GET",
        credentials: "include",
      });
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
    const res = await fetch(`http://localhost:3000/settings/${userID}`, {
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
    const res = await fetch(
      `http://localhost:3000/settings/change-password/${userID}`,
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
      const res = await fetch(`http://localhost:3000/settings/${userID}`, {
        method: "DELETE",
        credentials: "include",
      });
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
      className={`overflow-hidden mx-auto w-[70%] h-full bg-[#0b112d] rounded-2xl p-8 shadow-lg border border-[#1b254b] my-30 px-20 flex flex-col gap-20`}
    >
      <div className="py-10 px-10 w-full ">
        <p className="text-3xl font-bold text-white pl-8">Account Settings</p>

        <hr className="my-5 border-1 border-transparent h-1 w-[100%] mx-auto bg-gradient-to-r from-red-600 to-blue-600" />

        {/* Single Card Container */}
        {userID ? (
          <div className="mx-30 mt-20">
            <div className="flex flex-col gap-12">
              {/*Profile Information */}
              <div className="space-y-8 px-30 py-10  bg-slate-800/30 backdrop-blur-sm border border-blue-400/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                    <User className="text-blue-400" size={24} />
                    Profile
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 !bg-blue-600/80 hover:!bg-blue-600 text-white rounded-md transition-colors border !border-blue-500/50"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 px-4 py-2 !bg-green-600/80 hover:!bg-green-600 text-white rounded-md transition-colors border !border-green-500/50"
                      >
                        <Save size={16} />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-4 py-2 !bg-gray-600/80 hover:!bg-gray-600 text-white rounded-md transition-colors border !border-gray-500/50"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6 ">
                  {/* Admission Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Admission Number
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
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
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
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
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
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-md">
                        <Building className="text-blue-400" size={20} />
                        <span className="text-white">
                          {userData.department}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
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
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
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
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-md">
                        <GraduationCap className="text-blue-400" size={20} />
                        <span className="text-white">Year {userData.year}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className=" bg-slate-800/30 backdrop-blur-sm border border-blue-400/50 rounded-lg px-30 py-10">
                <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <Lock className="text-blue-400" size={24} />
                  Security
                </h3>

                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full px-4 py-3 !bg-slate-700/50 hover:!bg-slate-600/50 text-white rounded-md transition-colors border !border-slate-600"
                  >
                    Change Password
                  </button>
                ) : (
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
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
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 pr-10"
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
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
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
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 pr-10"
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
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
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
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 pr-10"
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
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handlePasswordChange}
                        className="flex-1 px-4 py-3 !bg-blue-600/80 hover:!bg-blue-600 text-white rounded-md transition-colors border !border-blue-500/50"
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
                        className="flex-1 px-4 py-3 !bg-gray-600/80 hover:!bg-gray-600 text-white rounded-md transition-colors border !border-gray-500/50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Actions Section */}
              <div className=" bg-slate-800/30 backdrop-blur-sm border border-red-600/50 rounded-lg px-30 py-10">
                <h3 className="text-2xl font-semibold text-white mb-6">
                  Account Actions
                </h3>
                <div className=" mx-auto flex justify-between">
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="w-[30%] px-4 py-3 !bg-red-600/50 hover:!bg-red-800 text-white rounded-md transition-colors flex items-center justify-center gap-2 border !border-red-600/50"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-[30%] px-4 py-3 !bg-slate-700/50  hover:!bg-slate-600/50 text-white rounded-md transition-colors flex items-center justify-center gap-2 border !border-red-500/50"
                  >
                    <Trash2 size={20} color="red" />
                    <span className="text-red-600 ">Delete Account</span>
                  </button>
                </div>
              </div>

              {showDeleteConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
                  <div className="bg-[#0b112d] border border-red-500/50 rounded-2xl shadow-lg w-[90%] max-w-md p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Confirm Account Deletion
                    </h2>
                    <p className="text-gray-300 mb-6">
                      Are you sure you want to delete your account? This action
                      cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 !bg-gray-600/80 hover:!bg-gray-600 text-white rounded-md border !border-gray-500/50"
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
                        className="px-4 py-2 !bg-red-600/80 hover:!bg-red-700 text-white rounded-md border !border-red-500/50"
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
          <p>Loading account...</p>
        )}
      </div>
    </div>
  );
};

export default Account;

// onClick={() => {

// }}
