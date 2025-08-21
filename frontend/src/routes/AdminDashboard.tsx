import React, { useEffect, useState, useCallback } from "react";
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
  XIcon,
} from "lucide-react";

import logo from "../assets/svlogo.svg";
import pdfIcon from "../assets/pdf-icon.png";
import {  useNavigate } from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useAuth } from "../context/useAuth";

type Printout = {
  _id: string;
  userId: string;
  url: string;
  filename: string;
  deletedByUser: boolean;
  isColored: boolean;
  qty: number;
  publicId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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
  deletedByUser: boolean;
  createdAt: string;
  updatedAt: string;
};
type User = {
  _id: string;
  admissionNo: string;
  department: string;
  year: number;
  password: string;
};
type HelpModel = {
  _id: string;
  ref_userId: string;
  admissionNo: string;
  deletedByUser: boolean;
  year: number;
  department: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type EnrichedOrderedFile = orderedFile & {
  admissionNo: string;
  department: string;
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
          onDateChange(date!);
        }}
        dateFormat="dd/MM/yyyy"
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
  const [users, setUsers] = useState<User[]>([]);
  const [printouts, setPrintouts] = useState<Printout[]>([]);
  const [orderedFiles, setOrderedFiles] = useState<orderedFile[]>([]);
  const [tickets, setTickets] = useState<HelpModel[]>([]);

  const [clearAllPrintoutsList, setClearAllPrintoutsList] = useState(false);
  const [clearAllOrderedFilesList, setClearAllOrderedFilesList] =
    useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/sign-up`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          console.log(
            "Permission denied. You are a logged-in user but not an admin."
          );
          window.location.href = "/dashboard";
        } else if (res.status === 401) {
          console.log("Unauthorized. Token is missing or invalid.");
          document.cookie = "token=; Max-Age=0;";
          window.location.href = "/login";
        }
        const errorData = await res.json();
        throw new Error(errorData.message);
      }
      const data = await res.json();
      setUsers(data.users);
      return data.users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }, []);

  const fetchPrintouts = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/uploadableFiles-DB`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        if (res.status === 403) {
          console.log(
            "Permission denied. You are a logged-in user but not an admin."
          );
          window.location.href = "/dashboard";
        } else if (res.status === 401) {
          console.log("Unauthorized. Token is missing or invalid.");
          document.cookie = "token=; Max-Age=0;";
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
        if (item.deletedByUser) {
          setClearAllPrintoutsList(true);
        } else {
          setClearAllPrintoutsList(false);
        }
      });

      setPrintouts(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, []);

  const getOrderedFiles = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/order-practical-files`,
        {
          method: "GET",
          credentials: "include",
        }
      );
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

      // console.log(data.finalOrders);

      data.finalOrders.forEach((item: orderedFile) => {
        item.createdAt = formatTime(item.createdAt);
        if (item.deletedByUser) {
          setClearAllOrderedFilesList(true);
        } else {
          setClearAllOrderedFilesList(false);
        }
      });

      setOrderedFiles(data.finalOrders);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, []);
  const [clearAllTicketsList, setClearAllTicketsList] = useState(false);

  const getTickets = useCallback(async (userList: User[]) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/order-practical-files/tickets`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      const helpArray = Array.isArray(data.tickets)
        ? data.tickets
        : [data.tickets];

      const enrichedTickets: HelpModel[] = helpArray.map(
        (ticket: HelpModel) => {
          // find user for this ticket
          const user = userList.find(
            (u) => u.admissionNo === ticket.admissionNo
          );

          return {
            ...ticket,
            _id: ticket._id,
            ref_userId: ticket.ref_userId,
            admissionNo: user?.admissionNo || "N/A",
            department: user?.department || "N/A",
            year: user?.year || 0,
            deletedByUser: ticket.deletedByUser || false,
            email: ticket.email || "N/A",
            message: ticket.message || "N/A",
            status: ticket.status || "N/A",
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
          };
        }
      );
      enrichedTickets.forEach((ticket: HelpModel) => {
        if (ticket.deletedByUser) {
          setClearAllTicketsList(true);
        } else {
          setClearAllTicketsList(false);
        }
      });

      setTickets(enrichedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  }, []);

  const changeQueryStatus = useCallback(
    async (_id: string) => {
      // Removed usersList from here
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/order-practical-files/tickets`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ _id }),
        }
      );

      setSelectedTicket(null); // Add this to clear the selected ticket
    },
    [] // Added users as a dependency
  );

  // Filter section states
  const [searchAdmissionNo, setSearchAdmissionNo] = useState("");
  const [searchFileName, setSearchFileName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchYear, setSearchYear] = useState<number | undefined>(undefined);

  const [printAdmissionNo, setPrintAdmissionNo] = useState("");
  const [printDepartment, setPrintDepartment] = useState("");
  const [printYear, setPrintYear] = useState<number | undefined>(undefined);
  const [printUploadDate, setPrintUploadDate] = useState<Date | null>(null);

  const [orderedFileAdmissionNo, setOrderedFileAdmissionNo] = useState("");
  const [orderedFileDepartment, setOrderedFileDepartment] = useState("");
  const [orderedFileYear, setOrderedFileYear] = useState<number | undefined>(
    undefined
  );
  const [orderedFileName, setOrderedFileName] = useState("");
  const [orderedFileCode, setOrderedFileCode] = useState("");
  const [orderedFileUploadDate, setOrderedFileUploadDate] =
    useState<Date | null>(null);

  const [queryTicketId, setQueryTicketId] = useState("");
  const [queryAdmissionNo, setQueryAdmissionNo] = useState("");
  const [queryDepartment, setQueryDepartment] = useState("");
  const [queryYear, setQueryYear] = useState<number | undefined>(undefined);

  const changePrintoutStatus = async (id: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/order-practical-files/changePrintoutStatus/${id}`,
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

  const changeFileStatus = async (
    ref_FileId: string,
    userId: string,
    _id: string
  ) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/order-practical-files/changeFileStatus`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ref_FileId, userId, _id }),
        }
      );
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

  // Users

  const filteredUsers = users.filter((user) => {
    const matchesAdmission = user.admissionNo
      .toLowerCase()
      .includes(searchAdmissionNo.toLowerCase());

    const matchesDepartment =
      searchDepartment === "" || user.department === searchDepartment;

    const matchesYear = searchYear === undefined || user.year === searchYear;

    return matchesAdmission && matchesDepartment && matchesYear;
  });

  // Printouts
  const UserEnrichedPrintouts = printouts.map((file) => {
    const user = users.find((u) => u._id === file.userId);
    return {
      ...file,
      admissionNo: user?.admissionNo || "",
      department: user?.department || "",
      year: user?.year || 0,
    };
  });

  const usersWithPrintouts = new Set<string>();

  UserEnrichedPrintouts.forEach((file) => {
    if (file.status === "pending") {
      usersWithPrintouts.add(file.userId.toString());
    }
  });

  const displayPrintouts = selectedUserId
    ? UserEnrichedPrintouts.filter((p) => p.userId === selectedUserId)
    : UserEnrichedPrintouts;

  const filteredEnrichedPrintouts = UserEnrichedPrintouts.filter((p) => {
    const matchesAdmission = p.admissionNo
      .toLowerCase()
      .includes(printAdmissionNo.toLowerCase());

    const matchesDepartment =
      printDepartment === "" ||
      p.department.toLowerCase() === printDepartment.toLowerCase();

    const matchesYear = printYear === undefined || p.year === printYear;
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

  // Ordered Files
  const UserEnrichedOrderedFiles: EnrichedOrderedFile[] = orderedFiles.map(
    (file) => {
      const user = users.find((u) => u._id === file.userId);
      return {
        ...file,
        admissionNo: user?.admissionNo || "",
        department: user?.department || "",
      };
    }
  );

  const displayOrderedFiles = selectedUserId
    ? UserEnrichedOrderedFiles.filter((p) => p.userId === selectedUserId)
    : UserEnrichedOrderedFiles;

  const usersWithOrderedFiles = new Set<string>();

  UserEnrichedOrderedFiles.forEach((file) => {
    if (file.status === "pending") {
      usersWithOrderedFiles.add(file.userId.toString());
    }
  });
  const filteredEnrichedOrderedFiles = UserEnrichedOrderedFiles.filter((p) => {
    const matchesAdmission = p.admissionNo
      .toLowerCase()
      .includes(orderedFileAdmissionNo.toLowerCase());

    const matchesDepartment =
      orderedFileDepartment === "" ||
      p.department.toLowerCase() === orderedFileDepartment.toLowerCase();

    const matchesYear =
      orderedFileYear === undefined || p.year === orderedFileYear;
    let matchesDate = true;

    const matchesFileName =
      orderedFileName === "" ||
      p.name!.toLowerCase().includes(orderedFileName.toLowerCase());

    const matchesFileCode =
      orderedFileCode === "" ||
      p.subject_code!.toLowerCase().includes(orderedFileCode.toLowerCase());

    if (orderedFileUploadDate) {
      const fileDate = new Date(p.createdAt).setHours(0, 0, 0, 0);
      const searchDateOnly = new Date(orderedFileUploadDate).setHours(
        0,
        0,
        0,
        0
      );
      matchesDate = fileDate === searchDateOnly;
    }

    return (
      matchesAdmission &&
      matchesDepartment &&
      matchesYear &&
      matchesDate &&
      matchesFileName &&
      matchesFileCode
    );
  });

  const sortedFilteredUsers = [...filteredUsers].sort((a, b) => {
    const aHasFiles =
      usersWithPrintouts.has(a._id) || usersWithOrderedFiles.has(a._id);
    const bHasFiles =
      usersWithPrintouts.has(b._id) || usersWithOrderedFiles.has(b._id);
    return (bHasFiles ? 1 : 0) - (aHasFiles ? 1 : 0);
  });

  // Tickets

  const filteredQueries = tickets.filter((ticket) => {
    const matchesAdmission = ticket.admissionNo
      .toLowerCase()
      .includes(queryAdmissionNo.toLowerCase());

    const matchesDepartment =
      queryDepartment === "" ||
      ticket.department.toLowerCase() === queryDepartment.toLowerCase();

    const matchesYear = queryYear === undefined || ticket.year === queryYear;

    const matchesTicketId =
      queryTicketId === "" ||
      (ticket._id.slice(-3) + ticket.admissionNo.slice(-3))
        .toString()
        .toLowerCase()
        .includes(queryTicketId.toLowerCase());

    return (
      matchesAdmission && matchesDepartment && matchesYear && matchesTicketId
    );
  });

  const sortedFilteredQueries = filteredQueries
    .map((ticket) => ({
      ...ticket,
      isOpen: ticket.status === "open",
    }))
    .sort((a, b) => {
      // open tickets first
      if (a.isOpen && !b.isOpen) return -1;
      if (!a.isOpen && b.isOpen) return 1;
      return 0;
    });

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HelpModel | null>(null);

  const openView = (ticket: HelpModel) => {
    setSelectedTicket(ticket);
    setIsViewOpen(true);
  };

  // Printouts --Deletion

  const deleteSelectedFile = async (
    id: string,
    url: string,
    publicId: string
  ) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/order-practical-files/`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, url, publicId }),
        }
      );
      if (!res.ok) throw new Error("Failed to delete file");
      setPrintouts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const clearAllPrintouts = useCallback(async (userId?: string | null) => {
    const url = userId
      ? `${import.meta.env.VITE_BACKEND_URL}/admin/order-practical-files/printouts?userId=${userId}`
      : `${import.meta.env.VITE_BACKEND_URL}/admin/order-practical-files/printouts`;
    await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });
    setPrintouts([]);
    setClearAllPrintoutsList(false);
  }, []);

  // Ordered Files --Deletion

  const deleteSelectedOrderedFile = useCallback(async (id: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/order-practical-files/orderedFiles/delete-selected`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );
      if (!res.ok) throw new Error("Failed to delete file");
      setOrderedFiles((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }, []);

  const clearAllOrderedFiles = useCallback(async (userId?: string | null) => {
    const url = userId
      ? `${import.meta.env.VITE_BACKEND_URL}/admin/order-practical-files/orderedFiles/delete-all/?userId=${userId}`
      : `${import.meta.env.VITE_BACKEND_URL}/admin/order-practical-files/orderedFiles/delete-all`;
    await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });
    setOrderedFiles([]);
    setClearAllOrderedFilesList(false);
  }, []);

  // Query --Deletion

  const removeTicket = useCallback(async (_id: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/admin/order-practical-files/tickets/${_id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (response.ok) {
      setTickets((prev) => prev.filter((ticket) => ticket._id !== _id));
    }
  }, []);

  const clearAllTickets = useCallback(async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/admin/order-practical-files/tickets`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (response.ok) {
      setTickets([]);
      setClearAllTicketsList(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const usersList = await fetchUsers();
      await fetchPrintouts();
      await getOrderedFiles();
      await getTickets(usersList);
    };
    fetchData();
  }, [
    users,
    fetchUsers,
    fetchPrintouts,
    getOrderedFiles,
    getTickets,
    changeQueryStatus,
    removeTicket,
    clearAllTickets,
    clearAllPrintouts,
    deleteSelectedOrderedFile,
    clearAllOrderedFiles,
  ]);

  return (
    <div
      className={`flex-1 overflow-auto p-8 bg-[rgba(5,7,26,0.82)] backdrop-blur-md shadow-lg text-white no-scrollbar ${
        isViewOpen ? "overflow-hidden" : ""
      }`}
    >
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
                    searchYear === undefined ? "!text-gray-600" : "!text-white"
                  }`}
                  onChange={(e) => setSearchYear(Number(e.target.value))}
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
              {sortedFilteredUsers.map((user: User, index: number) => {
                const hasPrintouts = usersWithPrintouts.has(user._id);
                const hasOrderedFiles = usersWithOrderedFiles.has(user._id);

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
                        <span className="text-blue-400">{user.department}</span>
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
                          hasPrintouts
                            ? " hover:!bg-red-300   "
                            : " hover:!bg-green-800  "
                        }`}
                        onClick={() => {
                          setSelectedUserId(user._id);
                          setactiveTab("Print outs");
                        }}
                      >
                        {hasPrintouts ? (
                          <AlertCircle
                            className={`h-4 w-4 ${
                              hasPrintouts
                                ? "!text-red-500 "
                                : "!text-green-400"
                            } `}
                          />
                        ) : (
                          <CheckCircle
                            className={`h-4 w-4 ${
                              hasPrintouts
                                ? "!text-red-500 "
                                : "!text-green-400"
                            } `}
                          />
                        )}

                        <span
                          className={`${
                            hasPrintouts ? "!text-red-500" : "!text-green-400"
                          } text-center `}
                        >
                          Print outs
                        </span>
                      </span>
                      <span
                        className={`flex gap-2 items-center justify-center w-1/2 hover:!cursor-pointer hover:!rounded-lg ${
                          hasOrderedFiles
                            ? " hover:!bg-red-300   "
                            : " hover:!bg-green-800  "
                        }`}
                        onClick={() => {
                          setSelectedUserId(user._id);
                          setactiveTab("File orders");
                        }}
                      >
                        {hasOrderedFiles ? (
                          <AlertCircle
                            className={`h-4 w-4 ${
                              hasOrderedFiles
                                ? "!text-red-500 "
                                : "!text-green-400"
                            } `}
                          />
                        ) : (
                          <CheckCircle
                            className={`h-4 w-4 ${
                              hasOrderedFiles
                                ? "!text-red-500 "
                                : "!text-green-400"
                            } `}
                          />
                        )}

                        <span
                          className={`${
                            hasOrderedFiles
                              ? "!text-red-500"
                              : "!text-green-400"
                          } text-center `}
                        >
                          File orders
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
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
                      printYear === undefined ? "!text-gray-600" : "!text-white"
                    }`}
                    onChange={(e) => setPrintYear(Number(e.target.value))}
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
            {(selectedUserId
              ? displayPrintouts.length > 0 &&
                displayPrintouts.every((printout) => printout.deletedByUser)
              : clearAllPrintoutsList) && (
              <div className="clear-all-button w-full flex justify-center !my-8">
                <button
                  className={`w-fit !text-lg !py-2 !text-white !bg-blue-600 hover:!bg-blue-600/70 `}
                  onClick={() => {
                    clearAllPrintouts(selectedUserId);
                  }}
                >
                  Clear all
                </button>
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
                      {printout.deletedByUser && (
                        <button
                          className="flex gap-2 items-center justify-center !text-white !bg-red-800 !py-2 rounded-lg"
                          onClick={() =>
                            deleteSelectedFile(
                              printout._id,
                              printout.url,
                              printout.publicId
                            )
                          }
                        >
                          <Trash2 className="h-6 w-6 " />
                        </button>
                      )}
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
                      onChange={(e) => setOrderedFileName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-md text-gray-300">File code</label>
                    <input
                      type="text"
                      placeholder="Search by file code"
                      onChange={(e) => setOrderedFileCode(e.target.value)}
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
                      onChange={(e) =>
                        setOrderedFileAdmissionNo(e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-md text-gray-300">Branch</label>
                    <select
                      className={`w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C]  appearance-none ${
                        orderedFileDepartment === ""
                          ? "!text-gray-600"
                          : "!text-white"
                      }`}
                      defaultValue=""
                      onChange={(e) => setOrderedFileDepartment(e.target.value)}
                    >
                      <option value="" className="!text-gray-600">
                        Select branch
                      </option>
                      <option value="Common">Common</option>
                      <option value="EEE">EEE</option>
                      <option value="ME">ME</option>
                      <option value="AI/ML">AI/ML</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-md text-gray-300">Year</label>
                    <select
                      className={`w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C]  appearance-none ${
                        orderedFileYear === undefined
                          ? "!text-gray-600"
                          : "!text-white"
                      }`}
                      onChange={(e) =>
                        setOrderedFileYear(Number(e.target.value))
                      }
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
                    onDateChange={(date: Date) =>
                      setOrderedFileUploadDate(date)
                    }
                  />
                </div>
              </div>
            )}

            {(selectedUserId
              ? displayOrderedFiles.length > 0 &&
                displayOrderedFiles.every((printout) => printout.deletedByUser)
              : clearAllOrderedFilesList) && (
              <div className="clear-all-button w-full flex justify-center !my-8">
                <button
                  className={`w-fit !text-lg !py-2 !text-white !bg-blue-600 hover:!bg-blue-600/70 `}
                  onClick={() => {
                    clearAllOrderedFiles(selectedUserId);
                  }}
                >
                  Clear all
                </button>
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
              (selectedUserId
                ? displayOrderedFiles
                : filteredEnrichedOrderedFiles
              ).map((file: EnrichedOrderedFile, index: number) => (
                <div
                  key={index}
                  className="bg-[#10182C] flex items-center text-gray-200 px-4 p-6 rounded-lg shadow-md border-b-2 border-gray-600"
                >
                  <div className="w-1/7 flex items-center justify-start pl-8">
                    {file.subject_code}
                  </div>

                  <div className="w-2/7 flex items-center truncate">
                    {file.name}
                  </div>

                  <div className="w-1/7  text-center flex items-center justify-center">
                    {file.department}
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
                        changeFileStatus(
                          file.ref_FileId,
                          file.userId,
                          file._id
                        );
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
                    {file.deletedByUser && (
                      <button
                        className="flex gap-2 items-center justify-center !text-white !bg-red-800 !py-2 rounded-lg"
                        onClick={() => {
                          deleteSelectedOrderedFile(file._id);
                        }}
                      >
                        <Trash2 className="h-6 w-6 " />
                      </button>
                    )}
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

        {/* Content for Queries tab */}
        {activeTab === "Queries" && (
          <div className="  w-full h-full  text-gray-200 p-10 rounded-lg shadow-md">
            {/* Search and Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-600 rounded-lg bg-[#2C3B68] mb-6">
              <div>
                <label className="text-md text-gray-300">Ticket ID</label>
                <input
                  type="text"
                  placeholder="Search by Ticket ID"
                  onChange={(e) => setQueryTicketId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C] text-white"
                />
              </div>
              <div>
                <label className="text-md text-gray-300">Admission no.</label>
                <input
                  type="text"
                  placeholder="Search by admission no."
                  onChange={(e) => setQueryAdmissionNo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C] text-white"
                />
              </div>
              <div>
                <label className="text-md text-gray-300">Department</label>
                <select
                  className={`w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C]  appearance-none ${
                    queryDepartment === "" ? "!text-gray-600" : "!text-white"
                  }`}
                  defaultValue=""
                  onChange={(e) => setQueryDepartment(e.target.value)}
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
                    queryYear === undefined ? "!text-gray-600" : "!text-white"
                  }`}
                  defaultValue=""
                  onChange={(e) => setQueryYear(Number(e.target.value))}
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

            {clearAllTicketsList && (
              <div className="clear-all-button w-full flex justify-center !mt-8">
                <button
                  className={`w-fit !text-lg !py-2 !text-white !bg-blue-600 hover:!bg-blue-600/70 `}
                  onClick={clearAllTickets}
                >
                  Clear All Tickets
                </button>
              </div>
            )}

            <div
              className={`${
                sortedFilteredQueries.length > 0 ? "" : "hidden"
              }grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 mt-15`}
            >
              {sortedFilteredQueries.length > 0 ? (
                sortedFilteredQueries.map(
                  (ticket: HelpModel, index: number) => {
                    return (
                      <div
                        key={index}
                        className="bg-[#2C3B68] flex flex-col rounded-md shadow-lg text-lg font-sans"
                      >
                        <div className="p-4 pl-5 ">
                          <p>
                            <span className="font-bold">Ticket ID : </span>
                            <span className="">
                              {ticket._id.slice(-3) +
                                ticket.admissionNo.slice(-3)}
                            </span>
                          </p>
                          <p>
                            <span className="font-bold">Admission no. : </span>
                            <span className="text-yellow-400">
                              {ticket.admissionNo}
                            </span>
                          </p>
                          <p>
                            <span className="font-bold ">Department : </span>
                            <span className="text-blue-400">
                              {ticket.department}
                            </span>
                          </p>
                          <p>
                            <span className="font-bold ">Year : </span>
                            {ticket.year}
                          </p>
                        </div>

                        <div
                          className={`w-full flex justify-between items-center  pb-4 pr-4 pl-6 ${
                            ticket.status === "closed"
                              ? "justify-between"
                              : "justify-end"
                          }`}
                        >
                          <div>
                            {ticket.deletedByUser ? (
                              <button
                                className="flex items-center justify-center !text-white !bg-red-800 !py-2 rounded-lg hover:!bg-red-700/70"
                                onClick={() => removeTicket(ticket._id)}
                              >
                                <Trash2 className="h-6 w-6 " />
                              </button>
                            ) : null}
                          </div>
                          <div>
                            <button
                              className={`!text-lg !py-1 !text-white   ${
                                ticket.status === "closed"
                                  ? "!bg-green-700 hover:!bg-green-700/70"
                                  : "!bg-red-700 hover:!bg-red-700/70"
                              }`}
                              onClick={() => openView(ticket)}
                            >
                              {ticket.status === "closed" ? (
                                <div className="flex gap-2 items-center justify-center">
                                  <CircleCheckBigIcon className="h-4 w-4 " />
                                  Resolved
                                </div>
                              ) : (
                                <div>View ticket</div>
                              )}
                            </button>
                          </div>
                        </div>
                        {/* View Modal */}

                        {isViewOpen && selectedTicket && (
                          <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50">
                            <div className="relative w-[70%] p-10 text-lg max-w-3xl bg-[#0B1534] rounded-2xl shadow-lg border border-[#1b254b] ">
                              {/* Close */}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsViewOpen(false);
                                  setSelectedTicket(null);
                                }}
                                className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-purple-900 via-blue-600 to-blue-800 rounded-lg hover:opacity-90 flex items-center justify-center"
                              >
                                <div className="absolute w-[90%] h-[90%] bg-[#0b112d] rounded-lg flex items-center justify-center">
                                  <XIcon className="text-blue-600 font-bold w-6 h-6" />
                                </div>
                              </button>

                              {/* Ticket Details (read-only) */}
                              <div className="space-y-8 mt-10">
                                <div className="flex flex-col gap-2">
                                  <div>
                                    Ticket ID :{" "}
                                    <span className="font-bold">
                                      {selectedTicket._id.slice(-3) +
                                        selectedTicket.admissionNo.slice(-3)}
                                    </span>
                                  </div>
                                  <div>
                                    Admission no. :{" "}
                                    <span className="font-bold">
                                      {selectedTicket.admissionNo}
                                    </span>
                                  </div>
                                  <div>
                                    Department :{" "}
                                    <span className="font-bold">
                                      {selectedTicket.department}
                                    </span>
                                  </div>
                                  <div>
                                    Year :{" "}
                                    <span className="font-bold">
                                      {selectedTicket.year}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-md font-medium text-gray-300 mb-2">
                                    Query :
                                  </label>
                                  <textarea
                                    readOnly
                                    rows={5}
                                    value={selectedTicket.message}
                                    className="w-full px-4 py-2 rounded-lg bg-[#0f1f47] border border-[#1b254b] text-white resize-none focus:outline-none focus:ring-0"
                                  />
                                </div>
                                <div className="flex justify-center">
                                  <button
                                    className={`flex  items-center justify-center !text-white  !py-2 rounded-lg 
                                  ${
                                    selectedTicket.status === "closed"
                                      ? "!bg-green-600"
                                      : "!bg-gray-600 hover:!bg-gray-600/50"
                                  }`}
                                    onClick={() => {
                                      changeQueryStatus(selectedTicket._id);
                                    }}
                                  >
                                    {selectedTicket.status === "closed" ? (
                                      <div className="flex gap-2 items-center justify-center">
                                        <CircleCheckBigIcon className="h-4 w-4 " />
                                        Resolved
                                      </div>
                                    ) : (
                                      <div>Mark as resolved</div>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )
              ) : (
                <div className="w-full bg-[#10182C] text-gray-200 px-4 p-6 rounded-lg shadow-md border-b-2 border-gray-600 flex items-center justify-center">
                  <p>No tickets found!</p>
                </div>
              )}
            </div>
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
          <div
            className="flex items-center gap-2 hover:cursor-pointer"
            onClick={() => setActiveTab("Users")}
          >
            <img src={logo} alt="" className="w-12 h-12 " />
            <p className="text-2xl font-bold bg-gradient-to-r from-gray-500 via-blue-400 to-gray-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer ">
              Printery
            </p>
          </div>
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
