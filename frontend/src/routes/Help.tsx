import { useEffect, useState, useCallback } from "react";
import {
  CircleCheckBig,
  MessageCircleQuestionMark,
  OctagonAlert,
  Trash2,
  XIcon,
} from "lucide-react";
import PrinteryButton from "../components/PrinteryButton";
import { useUser } from "../context/useUser";

type HelpModel = {
  _id: string;
  admissionNo: string;
  email: string; // ⬅ add
  message: string; // ⬅ add
  status: string;
  deletedByUser: string;
  createdAt: string;
  updatedAt: string;
};

const Help = () => {
  const { admissionNo, userID } = useUser();
  const [hasCapitalLetter, setHasCapitalLetter] = useState(false);

  const [admissionNoLength, setAdmissionNoLength] = useState(false);
  const [isEmailInvalid, setIsEmailInvalid] = useState(false);

  const [formData, setFormData] = useState({
    admissionNo: "",
    email: "",
    query: "",
  });
  useEffect(() => {
    if (admissionNo) {
      setFormData((prev) => ({ ...prev, admissionNo }));
    }
  }, [admissionNo]);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Admission No validations
    if (name === "admissionNo") {
      const containsUpperCase = /[A-Z]/.test(value);
      setHasCapitalLetter(containsUpperCase);

      if (value.length !== 0 && value.length !== 13) {
        setAdmissionNoLength(true);
      } else {
        setAdmissionNoLength(false);
      }

      if (value.length > 13) {
        setHasCapitalLetter(false);
      }
    }

    // Email validation
    if (name === "email") {
      if (value.length > 0 && !emailRegex.test(value)) {
        setIsEmailInvalid(true);
      } else {
        setIsEmailInvalid(false);
      }
    }
  };

  const [tickets, setTickets] = useState<HelpModel[]>([]);

  const [isOpen, setIsOpen] = useState(false);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HelpModel | null>(null);

  const openView = (ticket: HelpModel) => {
    setSelectedTicket(ticket);
    setIsViewOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { admissionNo, email, query } = formData;
    const sendHelp = await fetch("http://localhost:3000/help", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ admissionNo, email, query, ref_userId: userID }),
    });
    const data = await sendHelp.json();
    setTickets((prev) => [...prev, data.help]);
    setFormData({
      admissionNo: "",
      email: "",
      query: "",
    });
  };

  const [allTicketsClosed, setAllTicketsClosed] = useState(false);

  const fetchTickets = useCallback(async () => {
    const response = await fetch("http://localhost:3000/help", {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();

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

    const removedIds: string[] = JSON.parse(
      localStorage.getItem("removedTickets") || "[]"
    );

    data.help.forEach((item: HelpModel) => {
      item.createdAt = formatTime(item.createdAt);
      item.updatedAt = formatTime(item.updatedAt);
      if (item.status === "closed") {
        setAllTicketsClosed(true);
      }
      if (item.status === "open") {
        setAllTicketsClosed(false);
      }
    });

    

    setTickets(
      data.help.filter((ticket: HelpModel) => !removedIds.includes(ticket._id))
    );
  }, []);

  const removeTicket = useCallback(async (_id: string) => {
    try {
      const markDeleteTrue = await fetch("http://localhost:3000/help", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ _id }),
      });
      setTickets((prev) => prev.filter((ticket) => ticket._id !== _id));

      // store hidden IDs in localStorage
      const removedIds: string[] = JSON.parse(
        localStorage.getItem("removedTickets") || "[]"
      );
      if (!removedIds.includes(_id)) {
        localStorage.setItem(
          "removedTickets",
          JSON.stringify([...removedIds, _id])
        );
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  }, []);

  const clearClosedTickets = useCallback(async () => {
    setTickets((prev) => {
      // collect IDs of closed tickets
      const closedIds = prev
        .filter((ticket) => ticket.status === "closed")
        .map((ticket) => ticket._id);

      if (closedIds.length > 0) {
        // send all closed IDs to backend in one request
        fetch("http://localhost:3000/help/deleteAllQueries", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ ids: closedIds }), // 👈 send array
        });
      }

      // also store them locally (to persist across refresh)
      const removedIds: string[] = JSON.parse(
        localStorage.getItem("removedTickets") || "[]"
      );
      localStorage.setItem(
        "removedTickets",
        JSON.stringify([...new Set([...removedIds, ...closedIds])])
      );

      setAllTicketsClosed(false);

      // return only open tickets
      return prev.filter((ticket) => ticket.status !== "closed");
    });
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets, removeTicket, clearClosedTickets]);

  return (
    <div className=" bg-[#0b112d] rounded-2xl p-8 w-[70%]  shadow-lg border border-[#1b254b] mx-auto my-30 px-20 min-h-[70vh]">
      <div className="py-10 px-10 w-full h-full ">
        <p className="text-3xl font-bold text-white pl-8">Help & Support</p>

        <hr className=" my-5 border-1 border-transparent h-1 w-[100%] mx-auto bg-gradient-to-r from-red-600 to-blue-600" />
        <div className="flex flex-col min-w-full text-gray-300  justify-center gap-50 py-10">
          <div>
            <div className="flex border-b border-gray-700 w-[100%] mx-auto font-semibold  py-2 justify-center">
              <div className="w-1/6 text-center">Ticket ID</div>
              <div className="w-1/6 text-center">Admission No.</div>
              <div className="w-2/6 text-center">Open date</div>
              <div className="w-1/6 text-center">Status</div>
              <div className="w-2/6 text-center">Close date</div>
              <div className="w-2/6 text-center">Details</div>
            </div>
            <div className="flex flex-col w-[100%] mx-auto">
              {tickets.length > 0 ? (
                tickets.map((ticket: HelpModel, index) => (
                  <div
                    className="flex items-center border-b border-gray-800 w-[100%] mx-auto py-2  justify-center"
                    key={index}
                  >
                    <div className="w-1/6 flex items-center justify-center ">
                      {ticket._id.slice(-3) + ticket.admissionNo.slice(-3)}
                    </div>

                    <div className="w-1/6 flex items-center justify-center ">
                      {ticket.admissionNo}
                    </div>

                    <div className="w-2/6 flex items-center justify-center  ">
                      {ticket.createdAt}
                    </div>
                    <div className="w-1/6 flex justify-center items-center">
                      {ticket.status === "closed" ? (
                        <div className="flex items-center gap-2">
                          <CircleCheckBig className="w-5 h-5 text-green-500" />
                          Resolved
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <OctagonAlert className="w-5 h-5 text-red-500" />
                          Pending
                        </div>
                      )}
                    </div>
                    <div className="w-2/6 flex items-center justify-center ">
                      {ticket.status === "closed" ? ticket.updatedAt : "--"}
                    </div>

                    <div className="w-2/6 flex items-center ">
                      <div className="w-[70%] flex items-center justify-end pr-1">
                        <button
                          className={`w-fit !text-lg !py-1 !text-white !bg-blue-600 hover:!bg-blue-600/70 `}
                          onClick={() => openView(ticket)}
                        >
                          View
                        </button>
                      </div>
                      <div className="w-[30%] flex items-center pl-1">
                        {ticket.status === "closed" && (
                          <button
                            className="flex items-center justify-center !text-white !bg-red-800 !py-2 rounded-lg hover:!bg-red-800/70"
                            onClick={() => removeTicket(ticket._id)}
                          >
                            <Trash2 className="h-5 w-5 " />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center w-full mt-20">
                  No tickets yet
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center items-center">
            <div className="w-[45%] flex justify-end"></div>

            <div
              className={`w-[55%]  flex ${
                allTicketsClosed && tickets.length > 0
                  ? "justify-between"
                  : "justify-end"
              }`}
            >
              {allTicketsClosed && tickets.length > 0 && (
                <button
                  className={`w-fit !text-lg !py-1 !text-white !bg-blue-600 hover:!bg-blue-600/70 `}
                  onClick={clearClosedTickets}
                >
                  Clear All
                </button>
              )}
              <div
                className="w-fit h-10 bg-gradient-to-r from-purple-900 via-blue-600 to-blue-800  text-white rounded-lg font-medium hover:opacity-90 flex items-center gap-2 px-3 hover:cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
              >
                <MessageCircleQuestionMark /> <span>Open a ticket</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="relative w-[70%] p-15 text-lg max-w-3xl bg-[#0b112d] rounded-2xl  shadow-lg border border-[#1b254b] mt-40">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-purple-900 via-blue-600 to-blue-800 rounded-lg hover:opacity-90 flex items-center justify-center"
              >
                <div className="absolute w-[90%] h-[90%] bg-[#0b112d] rounded-lg flex items-center justify-center">
                  <XIcon className="text-blue-600 font-bold w-6 h-6" />
                </div>
              </button>

              <form onSubmit={handleSubmit} className="space-y-8 mt-10">
                {/* Admission No */}
                <div>
                  <label className="block text-md font-medium text-gray-300 mb-2">
                    Admission No
                  </label>
                  <input
                    type="text"
                    name="admissionNo"
                    value={formData.admissionNo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-[#0f1f47] border border-[#1b254b] text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter your admission number"
                    required
                  />
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

                {/* Email */}
                <div>
                  <label className="block text-md font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-[#0f1f47] border border-[#1b254b] text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                  {isEmailInvalid && (
                    <p className="text-red-500 text-sm mt-2">
                      Please enter a valid email address.
                    </p>
                  )}
                </div>

                {/* Query */}
                <div>
                  <label className="block text-md font-medium text-gray-300 mb-2">
                    Your Query
                  </label>
                  <textarea
                    name="query"
                    value={formData.query}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-2 rounded-lg bg-[#0f1f47] border border-[#1b254b] text-white focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Describe your issue or question..."
                    required
                  ></textarea>
                </div>

                {/* Submit */}
                <div className="w-[40%] mx-auto mt-8">
                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-purple-900 via-blue-600 to-blue-800  text-white rounded-lg font-medium hover:opacity-90"
                    onClick={() => setTimeout(() => setIsOpen(false), 1000)}
                  >
                    Submit Query
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}

        {isViewOpen && selectedTicket && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="relative w-[70%] p-10 text-lg max-w-3xl bg-[#0b112d] rounded-2xl shadow-lg border border-[#1b254b] mt-40">
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
                <div>
                  <label className="block text-md font-medium text-gray-300 mb-2">
                    Admission No
                  </label>
                  <input
                    readOnly
                    value={selectedTicket.admissionNo}
                    className="w-full px-4 py-2 rounded-lg bg-[#0f1f47] border border-[#1b254b] text-white"
                  />
                </div>

                <div>
                  <label className="block text-md font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    readOnly
                    value={selectedTicket.email || "Not provided"}
                    className="w-full px-4 py-2 rounded-lg bg-[#0f1f47] border border-[#1b254b] text-white"
                  />
                </div>

                <div>
                  <label className="block text-md font-medium text-gray-300 mb-2">
                    Your Query
                  </label>
                  <textarea
                    readOnly
                    rows={5}
                    value={selectedTicket.message}
                    className="w-full px-4 py-2 rounded-lg bg-[#0f1f47] border border-[#1b254b] text-white resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Help;
