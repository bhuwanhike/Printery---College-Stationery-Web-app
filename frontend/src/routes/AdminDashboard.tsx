import React, { useEffect, useState } from "react";
import {
  PrinterIcon,
  DollarSignIcon,
  UserIcon,
  File,
  HelpCircleIcon,
  LogOutIcon,
  Trash2,
  CheckCircle,
  AlertCircle,
  CircleCheckBigIcon,
} from "lucide-react";
import logo from "../assets/svlogo.svg";
import pdfIcon from "../assets/pdf-icon.png";
import { NavLink } from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

type Printout = {
  _id: string;
  userId: string;
  url: string;
  filename: string;
  isColored: boolean;
  qty: number;
  status: string;
  createdAt: string;
};
type orderedFile = {
  _id: string;
  userId: string;
  branch: string;
  name: string;
  qty: number;
  ref_FileId: string;
  status: string;
  subject_code: string;
  year: number;
  createdAt: string;
  updatedAt: string;
};

type User = {
  _id: string;
  admissionNo: string;
  department: string;
  year: string;
  password: string;
};

function DateFilter({ onDateChange }: { onDateChange: (date: Date) => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-300">Date</label>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => {
          setSelectedDate(date);
          onDateChange(date!); // Pass date to parent filter function
        }}
        dateFormat="dd/MM/yyyy" // Force dd/MM/yyyy
        placeholderText="dd/mm/yyyy"
        className="w-full px-4 py-2 border border-gray-600 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   bg-[#10182C] text-white placeholder-gray-400"
        calendarClassName="bg-[#10182C] text-white rounded-lg"
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
      />
    </div>
  );
}

const MainContent = ({
  activeTab,
  setactiveTab,
  selectedUserId,
  setSelectedUserId,
}: {
  activeTab: string;
  setactiveTab: React.Dispatch<React.SetStateAction<string>>;
  selectedUserId: string | null;
  setSelectedUserId: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const [printouts, setPrintouts] = useState<Printout[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orderedFiles, setOrderedFiles] = useState<orderedFile[]>([]);

  const fetchPrintouts = async () => {
    try {
      const res = await fetch("http://localhost:3000/uploadableFiles-DB", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        // This block runs for 4xx and 5xx status codes
        if (res.status === 403) {
          // User is authenticated but not an admin. Do NOT clear cookie.
          // Redirect to a non-admin dashboard or show a "permission denied" message.
          console.log(
            "Permission denied. You are a logged-in user but not an admin."
          );
          window.location.href = "/dashboard";
        } else if (res.status === 401) {
          // User is not authenticated. Clear cookie and redirect to login.
          console.log("Unauthorized. Token is missing or invalid.");
          document.cookie = "token=; Max-Age=0;"; // This is where the cookie should be cleared
          window.location.href = "/login";
        }
        const errorData = await res.json();
        throw new Error(errorData.message);
      }
      const data = await res.json();
      const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });
      };

      data.forEach((item: Printout) => {
        item.createdAt = formatTime(item.createdAt);
      });
      setPrintouts(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/sign-up", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        // This block runs for 4xx and 5xx status codes
        if (res.status === 403) {
          // User is authenticated but not an admin. Do NOT clear cookie.
          // Redirect to a non-admin dashboard or show a "permission denied" message.
          console.log(
            "Permission denied. You are a logged-in user but not an admin."
          );
          window.location.href = "/dashboard";
        } else if (res.status === 401) {
          // User is not authenticated. Clear cookie and redirect to login.
          console.log("Unauthorized. Token is missing or invalid.");
          document.cookie = "token=; Max-Age=0;"; // This is where the cookie should be cleared
          window.location.href = "/login";
        }
        const errorData = await res.json();
        throw new Error(errorData.message);
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getOrderedFiles = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/admin/order-practical-files",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      console.log(data.finalOrders);

      const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });
      };

      data.finalOrders.forEach((item: orderedFile) => {
        item.createdAt = formatTime(item.createdAt);
      });

      setOrderedFiles(data.finalOrders);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchPrintouts();
    fetchUsers();
    getOrderedFiles();
  }, []);

  // Filter section states
  const [searchAdmissionNo, setSearchAdmissionNo] = useState("");
  const [searchFileName, setSearchFileName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchYear, setSearchYear] = useState("");

  const [printAdmissionNo, setPrintAdmissionNo] = useState("");
  const [printDepartment, setPrintDepartment] = useState("");
  const [printYear, setPrintYear] = useState("");
  const [printUploadDate, setPrintUploadDate] = useState<Date | null>(null);

  const changePrintoutStatus = async (id: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/uploadableFiles-DB/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "completed" }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      setPrintouts((prev) =>
        prev.map((file) =>
          file._id === id ? { ...file, status: "completed" } : file
        )
      );
    } catch (error) {
      console.error("Error changing file status:", error);
    }
  };
  const changeFileStatus = async (ref_FileId: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/admin/order-practical-files`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ref_FileId }),
        }
      );
      // console.log(res);
      if (!res.ok) throw new Error("Failed to update status");
      setOrderedFiles((prev) =>
        prev.map((file) =>
          file.ref_FileId === ref_FileId
            ? { ...file, status: "completed" }
            : file
        )
      );
    } catch (error) {
      console.error("Error changing file status:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesAdmission = user.admissionNo
      .toLowerCase()
      .includes(searchAdmissionNo.toLowerCase());

    const matchesDepartment =
      searchDepartment === "" || user.department === searchDepartment;

    const matchesYear =
      searchYear === "" || user.year.toString() === searchYear;

    return matchesAdmission && matchesDepartment && matchesYear;
  });
  const UserEnrichedPrintouts = printouts.map((file) => {
    const user = users.find(
      (u) => u._id.toString() === file.userId?.toString()
    );
    return {
      ...file,
      admissionNo: user?.admissionNo || "",
      department: user?.department || "",
      year: user?.year || "",
    };
  });

  const usersWithFiles = new Set(
    UserEnrichedPrintouts.map((p) => p.userId?.toString())
  );
  const sortedFilteredUsers = [...filteredUsers].sort((a, b) => {
    const aHasFiles = a._id! && usersWithFiles.has(a._id!.toString());
    const bHasFiles = b._id! && usersWithFiles.has(b._id!.toString());
    return (bHasFiles ? 1 : 0) - (aHasFiles ? 1 : 0);
  });

  const displayPrintouts = selectedUserId
    ? UserEnrichedPrintouts.filter(
        (p) => p.userId?.toString() === selectedUserId
      )
    : UserEnrichedPrintouts;

  const filteredEnrichedPrintouts = UserEnrichedPrintouts.filter((p) => {
    const matchesAdmission = p.admissionNo
      .toLowerCase()
      .includes(printAdmissionNo.toLowerCase());

    const matchesDepartment =
      printDepartment === "" || p.department === printDepartment;

    const matchesYear = printYear === "" || p.year.toString() === printYear;
    let matchesDate = true;

    const matchesFileName =
      searchFileName === "" ||
      p.filename!.toLowerCase().includes(searchFileName.toLowerCase());

    if (printUploadDate) {
      const fileDate = new Date(p.createdAt).setHours(0, 0, 0, 0);
      const searchDateOnly = new Date(printUploadDate).setHours(0, 0, 0, 0);
      matchesDate = fileDate === searchDateOnly;
    }

    return (
      matchesAdmission &&
      matchesDepartment &&
      matchesYear &&
      matchesDate &&
      matchesFileName
    );
  });

  const UserEnrichedOrderedFiles = orderedFiles.map((file) => {
    const user = users.find(
      (u) => u._id.toString() === file.userId?.toString()
    );
    return {
      ...file,
      admissionNo: user?.admissionNo || "",
      department: user?.department || "",
      year: user?.year || "",
    };
  });
  const displayOrderedFiles = selectedUserId
    ? UserEnrichedOrderedFiles.filter(
        (p) => p.userId?.toString() === selectedUserId
      )
    : UserEnrichedOrderedFiles;

  const usersWithOrderedFiles = new Set(
    UserEnrichedOrderedFiles.map((p) => p.userId?.toString())
  );

  const filteredEnrichedOrderedFiles = UserEnrichedOrderedFiles.filter((p) => {
    const matchesAdmission = p.admissionNo
      .toLowerCase()
      .includes(printAdmissionNo.toLowerCase());

    const matchesDepartment =
      printDepartment === "" || p.department === printDepartment;

    const matchesYear = printYear === "" || p.year.toString() === printYear;
    let matchesDate = true;

    const matchesFileName =
      searchFileName === "" ||
      p.name!.toLowerCase().includes(searchFileName.toLowerCase());

    if (printUploadDate) {
      const fileDate = new Date(p.createdAt).setHours(0, 0, 0, 0);
      const searchDateOnly = new Date(printUploadDate).setHours(0, 0, 0, 0);
      matchesDate = fileDate === searchDateOnly;
    }

    return (
      matchesAdmission &&
      matchesDepartment &&
      matchesYear &&
      matchesDate &&
      matchesFileName
    );
  });

  return (
    <div className="flex-1 overflow-auto p-8 bg-[rgba(5,7,26,0.82)] backdrop-blur-md shadow-lg text-white no-scrollbar">
      <div className="bg-[#10182C] text-gray-200 p-6 rounded-lg shadow-md">
        {/* Content for Users tab */}
        {activeTab === "Users" && (
          <div className="  w-full h-full  text-gray-200 p-10 rounded-lg shadow-md">
            {/* Search and Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-600 rounded-lg bg-[#2C3B68] mb-6">
              <div>
                <label className="text-md text-gray-300">Admission no.</label>
                <input
                  type="text"
                  placeholder="Search by admission no."
                  onChange={(e) => setSearchAdmissionNo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C] text-white"
                />
              </div>
              <div>
                <label className="text-md text-gray-300">Department</label>
                <select
                  className={`w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C]  appearance-none ${
                    searchDepartment === "" ? "!text-gray-600" : "!text-white"
                  }`}
                  defaultValue=""
                  onChange={(e) => setSearchDepartment(e.target.value)}
                >
                  <option value="" className="!text-gray-600">
                    Select department
                  </option>
                  <option value="CSE">CSE</option>
                  <option value="EEE">EEE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                </select>
              </div>
              <div>
                <label className="text-md text-gray-300">Year</label>
                <select
                  className={`w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C]  appearance-none ${
                    searchYear === "" ? "!text-gray-600" : "!text-white"
                  }`}
                  onChange={(e) => setSearchYear(e.target.value)}
                  defaultValue=""
                >
                  <option value="" className="!text-gray-600">
                    Select year
                  </option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 mt-15">
              {sortedFilteredUsers.map(
                (user: User & { _id?: string }, index: number) => {
                  // Check if this user has any file in DB using userId reference
                  const hasFiles =
                    user._id && usersWithFiles.has(user._id.toString());
                  const hasOrderedFiles =
                    user._id && usersWithOrderedFiles.has(user._id.toString());

                  return (
                    <div
                      key={index}
                      className="bg-[#2C3B68] flex flex-col rounded-md shadow-lg text-lg font-sans"
                    >
                      <div className="p-4 pl-5 ">
                        <p>
                          <span className="font-bold">Admission no. : </span>
                          <span className="text-yellow-400">
                            {user.admissionNo}
                          </span>
                        </p>
                        <p>
                          <span className="font-bold ">Department : </span>
                          <span className="text-blue-400">
                            {user.department}
                          </span>
                        </p>
                        <p>
                          <span className="font-bold ">Year : </span>
                          {user.year}
                        </p>
                      </div>

                      {/* Conditional red text if files exist */}
                      <div className="flex justify-center items-center gap-2 mt-4 border-t border-gray-500 p-4 pt-2 ">
                        <span
                          className={`flex gap-2 items-center justify-center w-1/2 hover:!cursor-pointer hover:!rounded-lg ${
                            hasFiles
                              ? " hover:!bg-red-300   "
                              : " hover:!bg-green-800  "
                          }`}
                        >
                          {hasFiles ? (
                            <AlertCircle
                              className={`h-4 w-4 ${
                                hasFiles ? "text-red-500 " : "text-green-400"
                              } `}
                            />
                          ) : (
                            <CheckCircle
                              className={`h-4 w-4 ${
                                hasFiles ? "text-red-500 " : "text-green-400"
                              } `}
                            />
                          )}

                          <a
                            className={`${
                              hasFiles ? "!text-red-500" : "!text-green-400"
                            } text-center `}
                            onClick={() => {
                              setSelectedUserId(user._id);
                              setactiveTab("Print outs");
                            }}
                          >
                            Print outs
                          </a>
                        </span>
                        <span
                          className={`flex gap-2 items-center justify-center w-1/2 hover:!cursor-pointer hover:!rounded-lg ${
                            hasOrderedFiles
                              ? " hover:!bg-red-300   "
                              : " hover:!bg-green-800  "
                          }`}
                        >
                          {hasOrderedFiles ? (
                            <AlertCircle
                              className={`h-4 w-4 ${
                                hasFiles ? "text-red-500 " : "text-green-400"
                              } `}
                            />
                          ) : (
                            <CheckCircle
                              className={`h-4 w-4 ${
                                hasOrderedFiles
                                  ? "text-red-500 "
                                  : "text-green-400"
                              } `}
                            />
                          )}

                          <a
                            className={`${
                              hasOrderedFiles
                                ? "!text-red-500"
                                : "!text-green-400"
                            } text-center `}
                            onClick={() => {
                              setSelectedUserId(user._id);
                              setactiveTab("File orders");
                            }}
                          >
                            File orders
                          </a>
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* Content for Print outs tab */}
        {activeTab === "Print outs" && (
          <>
            {/* Warning Message */}
            <div className="text-center text-red-500 text-lg mb-4 tracking-wider animate-text-flow">
              <span className="font-bold"> Warning:</span> It's mandatory to
              delete orders after completion to maintain record consistency.
            </div>

            {selectedUserId && (
              <div className=" text-lg mt-6 tracking-wide mb-6 pl-4 p-4   w-fit rounded-lg ">
                Files uploaded by user with admission no. :{" "}
                <span className="font-bold">
                  {
                    users.find((user) => user._id === selectedUserId)
                      ?.admissionNo
                  }
                </span>
              </div>
            )}

            {/* Search and Filters Section */}
            {!selectedUserId && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-600 rounded-lg bg-[#2C3B68] mb-6">
                <div>
                  <label className="text-md text-gray-300">File name</label>
                  <input
                    type="text"
                    placeholder="Search by file name"
                    onChange={(e) => setSearchFileName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C] text-white"
                  />
                </div>
                <div>
                  <label className="text-md text-gray-300">Admission no.</label>
                  <input
                    type="text"
                    placeholder="Search by admission no."
                    onChange={(e) => setPrintAdmissionNo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C] text-white"
                  />
                </div>
                <div>
                  <label className="text-md text-gray-300">Department</label>
                  <select
                    className={`w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C]  appearance-none ${
                      printDepartment === "" ? "!text-gray-600" : "!text-white"
                    }`}
                    defaultValue=""
                    onChange={(e) => setPrintDepartment(e.target.value)}
                  >
                    <option value="" className="!text-gray-600">
                      Select department
                    </option>
                    <option value="CSE">CSE</option>
                    <option value="EEE">EEE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div>
                  <label className="text-md text-gray-300">Year</label>
                  <select
                    className={`w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C]  appearance-none ${
                      printYear === "" ? "!text-gray-600" : "!text-white"
                    }`}
                    onChange={(e) => setPrintYear(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" className="!text-gray-600">
                      Select year
                    </option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
                <DateFilter
                  onDateChange={(date: Date) => setPrintUploadDate(date)}
                />
              </div>
            )}

            <div className="headers flex justify-between px-4 w-full items-center bg-zinc-800 py-2 rounded-lg">
              <p className="w-1/6 text-center">File </p>
              <p className="w-1/6 text-center">Download</p>
              <p className="w-1/6 text-center">B-W / Colored</p>
              <p className="w-1/6 text-center">Qty</p>
              <p className="w-1/6 text-center">Uploaded on</p>
              <p className="w-1/6 text-center">Status</p>
            </div>
            {(selectedUserId ? displayPrintouts : filteredEnrichedPrintouts)
              .length > 0 ? (
              (selectedUserId
                ? displayPrintouts
                : filteredEnrichedPrintouts
              ).map((printout: Printout, index: number) => (
                <div
                  key={index}
                  className="bg-[#10182C] text-gray-200 px-4 p-6 rounded-lg shadow-md border-b-2 border-gray-600"
                >
                  <div className="flex justify-between ">
                    <div className="w-1/6 flex items-center gap-4 pl-2">
                      <div className="w-12 h-12">
                        <img
                          src={
                            printout.filename.endsWith(".pdf")
                              ? pdfIcon
                              : printout.url
                          }
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="truncate">{printout.filename}</p>
                    </div>
                    <div className="w-1/6 text-center flex justify-center items-center">
                      <a
                        href={printout.url}
                        target="_blank"
                        className="!text-white bg-blue-500 p-2 rounded-lg"
                      >
                        Print file
                      </a>
                    </div>
                    <div className="w-1/6  text-center flex items-center justify-center">
                      {printout.isColored ? "Colored" : "Black & White"}
                    </div>
                    <div className="w-1/6 text-center flex items-center justify-center">
                      {printout.qty}
                    </div>
                    <div className="w-1/6 text-center flex flex-col justify-center items-center">
                      <p>{printout.createdAt}</p>
                    </div>
                    <div className="w-1/6 flex justify-center items-center gap-3">
                      <button
                        className={`flex  items-center justify-center !text-white !bg-gray-600 !py-2 rounded-lg ${
                          printout.status === "completed" ? "!bg-green-600" : ""
                        }`}
                        onClick={() => {
                          changePrintoutStatus(printout._id);
                        }}
                      >
                        {printout.status === "completed" ? (
                          <div className="flex gap-2 items-center justify-center">
                            <CircleCheckBigIcon className="h-4 w-4 " />
                            Completed
                          </div>
                        ) : (
                          <div>Mark as completed</div>
                        )}
                      </button>
                      {printout.status === "completed" ? (
                        <button className="flex gap-2 items-center justify-center !text-white !bg-red-800 !py-2 rounded-lg">
                          <Trash2 className="h-6 w-6 " />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#10182C] text-gray-200 px-4 p-6 rounded-lg shadow-md border-b-2 border-gray-600 text-center">
                <p>No files found!</p>
              </div>
            )}
          </>
        )}

        {/* Content for File orders tab */}
        {activeTab === "File orders" && (
          <>
            {/* Warning Message */}
            <div className="text-center text-red-500 text-lg mb-4 tracking-wider animate-text-flow">
              <span className="font-bold"> Warning:</span> It's mandatory to
              delete orders after completion to maintain record consistency.
            </div>

            {selectedUserId && (
              <div className=" text-lg mt-6 tracking-wide mb-6 pl-4 p-4   w-fit rounded-lg ">
                Files uploaded by user with admission no. :{" "}
                <span className="font-bold">
                  {
                    users.find((user) => user._id === selectedUserId)
                      ?.admissionNo
                  }
                </span>
              </div>
            )}

            {/* Search and Filters Section */}
            {!selectedUserId && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6  p-4 border border-gray-600 rounded-lg bg-[#2C3B68] mb-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-md text-gray-300">File name</label>
                    <input
                      type="text"
                      placeholder="Search by file name"
                      onChange={(e) => setSearchFileName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-md text-gray-300">File code</label>
                    <input
                      type="text"
                      placeholder="Search by file code"
                      onChange={(e) => setSearchFileName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C] text-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-md text-gray-300">
                      Admission no.
                    </label>
                    <input
                      type="text"
                      placeholder="Search by admission no."
                      onChange={(e) => setPrintAdmissionNo(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-md text-gray-300">Department</label>
                    <select
                      className={`w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C]  appearance-none ${
                        printDepartment === ""
                          ? "!text-gray-600"
                          : "!text-white"
                      }`}
                      defaultValue=""
                      onChange={(e) => setPrintDepartment(e.target.value)}
                    >
                      <option value="" className="!text-gray-600">
                        Select department
                      </option>
                      <option value="CSE">CSE</option>
                      <option value="EEE">EEE</option>
                      <option value="ME">ME</option>
                      <option value="CE">CE</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-md text-gray-300">Year</label>
                    <select
                      className={`w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C]  appearance-none ${
                        printYear === "" ? "!text-gray-600" : "!text-white"
                      }`}
                      onChange={(e) => setPrintYear(e.target.value)}
                      defaultValue=""
                    >
                      <option value="" className="!text-gray-600">
                        Select year
                      </option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                  <DateFilter
                    onDateChange={(date: Date) => setPrintUploadDate(date)}
                  />
                </div>
              </div>
            )}

            <div className="headers flex justify-between px-4 w-full items-center bg-zinc-800 py-2 rounded-lg">
              <p className="w-1/7 text-center">File Code</p>
              <p className="w-2/7 text-center">File Name</p>
              <p className="w-1/7 text-center">Branch</p>
              <p className="w-1/7 text-center">Year</p>
              <p className="w-1/7 text-center">Qty</p>
              <p className="w-2/7 text-center">Uploaded on</p>
              <p className="w-2/7 text-center">Status</p>
            </div>
            {(selectedUserId
              ? displayOrderedFiles
              : filteredEnrichedOrderedFiles
            ).length > 0 ? (
              (selectedUserId ? displayOrderedFiles : orderedFiles).map(
                (file: any) => (
                  <div
                    key={file._id}
                    className="bg-[#10182C] flex items-center text-gray-200 px-4 p-6 rounded-lg shadow-md border-b-2 border-gray-600"
                  >
                    <>{console.log(orderedFiles)}</>
                    <div className="w-1/7 flex items-center justify-start pl-8">
                      {file.subject_code}
                    </div>

                    <div className="w-2/7 flex items-center truncate">
                      {file.name}
                    </div>

                    <div className="w-1/7  text-center flex items-center justify-center">
                      {file.branch}
                    </div>

                    <div className="w-1/7 text-center flex items-center justify-center">
                      {file.year}
                    </div>

                    <div className="w-1/7  text-center flex items-center justify-center">
                      {file.qty}
                    </div>

                    <div className="w-2/7 text-center flex flex-col justify-center items-center">
                      <p>{file.createdAt}</p>
                    </div>
                    <div className="w-2/7 flex justify-center items-center gap-3">
                      <button
                        className={`flex  items-center justify-center !text-white !bg-gray-600 !py-2 rounded-lg 
                        ${file.status === "completed" ? "!bg-green-600" : ""}`}
                        onClick={() => {
                          changeFileStatus(file.ref_FileId);
                        }}
                      >
                        {file.status === "completed" ? (
                          <div className="flex gap-2 items-center justify-center">
                            <CircleCheckBigIcon className="h-4 w-4 " />
                            Completed
                          </div>
                        ) : (
                          <div>Mark as completed</div>
                        )}
                      </button>
                      {file.status === "completed" ? (
                        <button className="flex gap-2 items-center justify-center !text-white !bg-red-800 !py-2 rounded-lg">
                          <Trash2 className="h-6 w-6 " />
                        </button>
                      ) : null}
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="bg-[#10182C] text-gray-200 px-4 p-6 rounded-lg shadow-md border-b-2 border-gray-600 text-center">
                <p>No files found!</p>
              </div>
            )}
          </>
        )}

        {/* Content for Queries tab */}
        {activeTab === "Queries" && (
          <div className="bg-[#10182C] text-gray-200 p-6 rounded-lg shadow-md">
            <p className="text-gray-400">
              This is the content for the **{activeTab}** section.
            </p>
          </div>
        )}
        {/* Content for Payments tab */}
        {activeTab === "Payments" && (
          <div className="bg-[#10182C] text-gray-200 p-6 rounded-lg shadow-md">
            <p className="text-gray-400">
              This is the content for the **{activeTab}** section.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Users");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const topTabs = [
    { name: "Users", icon: UserIcon },
    { name: "Print outs", icon: PrinterIcon },
    { name: "File orders", icon: File },
    { name: "Queries", icon: HelpCircleIcon },
    { name: "Payments", icon: DollarSignIcon },
  ];

  const bottomTabs = [{ name: "Log out", icon: LogOutIcon }];

  return (
    <div className="flex h-screen w-screen bg-[#10182C]">
      {/* Static Sidebar */}
      <div className="w-64 bg-[#0B1534] text-white p-6 flex flex-col justify-between shadow-lg pt-8 ">
        <div className="flex flex-col gap-15">
          <NavLink
            to="/admin/dashboard"
            className="flex items-center gap-2 hover:cursor-pointer"
          >
            <img src={logo} alt="" className="w-12 h-12 " />
            <p className="text-2xl font-bold bg-gradient-to-r from-gray-500 via-blue-400 to-gray-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer ">
              Printery
            </p>
          </NavLink>
          <nav className="space-y-2">
            {topTabs.map((tab) => (
              <a
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 hover:cursor-pointer ${
                  activeTab === tab.name
                    ? "bg-blue-900 !text-white"
                    : "text-gray-300 hover:bg-[#2C3B68]"
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                <span>{tab.name}</span>
              </a>
            ))}
          </nav>
        </div>
        <nav className="space-y-2 border-t border-gray-200 pt-6">
          {bottomTabs.map((tab) => (
            <a
              key={tab.name}
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                activeTab === tab.name
                  ? "!text-red-500"
                  : "!text-red-500 hover:bg-[#2C3B68]"
              }`}
            >
              <tab.icon className="h-5 w-5 mr-3" />
              <span>{tab.name}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content and Header */}
      <div className="flex-1 flex flex-col">
        <MainContent
          activeTab={activeTab}
          setactiveTab={setActiveTab}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
