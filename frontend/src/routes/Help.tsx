import { useEffect, useState, useCallback } from "react";
import {
  CircleCheckBig,
  MessageCircleQuestionMark,
  OctagonAlert,
  Trash2,
  XIcon,
} from "lucide-react";

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

  const [containSpecialCharacter, setContainSpecialCharacter] = useState(false);

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

      const containsSpecialCharater = /[^A-Za-z0-9]/.test(value);
      setContainSpecialCharacter(containsSpecialCharater);

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
    const sendHelp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/help`, {
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
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/help`, {
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
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/help`, {
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
        fetch(`${import.meta.env.VITE_BACKEND_URL}/help/deleteAllQueries`, {
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
    <div className="xs:min-w-[95%] xs:my-[10vh] 2xs:my-[12vh]  xsm:my-[12vh] nsl:my-[16vh] nsl:min-w-[85%] sm:min-w-[80%] sm:!p-12  md:min-w-[75%] md:my-45 xl:my-50  mx-auto bg-[#0b112d] w-[70%] h-full rounded-2xl xs:p-8 shadow-lg border border-[#1b254b] px-20 flex flex-col items-center justify-center xs:gap-15 gap-20 2xl:my-60 ">
      <div className="xs:p-0 py-10 px-10 w-full ">
        <p className="xs:text-[19px] xsm:text-[22px] lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-white">
          Help & Support
        </p>

        <hr className="xs:w-full xs:my-2 xsm:my-1 border-1 md:my-3 border-transparent xs:h-[3px] h-1 xs:min-w-[75vw]  bg-gradient-to-r from-red-600 to-blue-600 sm:min-w-[90%] md:min-w-[62vw]" />

        <div className="flex flex-col items-center gap-10 xs:my-10">
          <div className="flex flex-col w-[100%] text-gray-300 justify-center xs:overflow-x-scroll ">
            <div className="flex xs:w-[600vw] 2xs:w-[400vw] xxs:w-[300vw] xsm:w-[250vw] xsl:w-[220vw]  nsl:mx-3 nsl:w-[200vw] sm:w-[170vw] md:mx-9 md:w-[150vw] xs:text-[20px]  lg:w-[120vw] lg:mx-auto 2lg:w-[100vw] nxl:w-[90vw] 2xl:w-[80vw]  border-b border-gray-700 font-semibold xs:px-1 items-center py-2 justify-center bg-gray-700 nsl:text-[15px] rounded-sm  sm:text-[15px] sm:mb-4 2xl:text-lg">
              <div className="w-1/6 text-center">Ticket ID</div>
              <div className="w-2/6 text-center">Admission No.</div>
              <div className="w-2/6 text-center">Open date</div>
              <div className="w-2/6 text-center">Status</div>
              <div className="w-2/6 text-center">Close date</div>
              <div className="w-2/6 text-center">Details</div>
            </div>
            <div className="flex flex-col w-[100%] mx-auto">
              {tickets.length > 0 ? (
                tickets.map((ticket: HelpModel, index) => (
                  <div
                    className="flex xs:w-[600vw] xs:text-[20px] nsl:text-[18px]  2xs:w-[400vw] xxs:w-[300vw] xsl:w-[220vw] xsm:w-[250vw] nsl:mx-3 nsl:w-[200vw] sm:w-[170vw] md:mx-9 md:w-[150vw] xs:mt-3 lg:w-[120vw] lg:mx-auto 2lg:w-[100vw] nxl:w-[90vw] 2xl:w-[80vw] border-b border-gray-700 font-semibold xs:px-0 px-4 py-2 justify-center items-center "
                    key={index}
                  >
                    <div className="w-1/6 flex items-center justify-center ">
                      {ticket._id.slice(-3) + ticket.admissionNo.slice(-3)}
                    </div>

                    <div className="w-2/6 flex items-center justify-center ">
                      {ticket.admissionNo}
                    </div>

                    <div className="w-2/6 flex items-center justify-center  xsm:text-center">
                      {ticket.createdAt}
                    </div>
                    <div className="w-2/6 flex justify-center items-center">
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
                    <div className="w-2/6 flex items-center justify-center xsm:text-center">
                      {ticket.status === "closed" ? ticket.updatedAt : "--"}
                    </div>

                    <div className="w-2/6 flex items-center ">
                      <div className="w-[70%] flex items-center justify-end pr-1">
                        <button
                          className={`w-fit !text-lg !py-1 !text-white !bg-blue-600 hover:!bg-blue-600/70 xs:!text-[22px]`}
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
                            <Trash2 className="xs:h-7 xs:w-7 h-6 w-6 " />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="xs:mt-4 xs:text-[20px] xxs:mt-8 text-gray-300 flex items-center justify-center xsl:text-[16px] xsl:py-8 xsm:text-[15px] 2xl:text-xl">
                  No tickets yet
                </div>
              )}
            </div>
          </div>

          <div className="flex xs:flex-col xs:gap-6 justify-center items-center sm:flex-row sm:justify-between sm:w-[90%] nxl:w-[50%]">
            {allTicketsClosed && tickets.length > 0 && (
              <button
                className={`xs:mt-4 sm:mt-0 xs:!p-3 flex xs:!text-[20px] flex-col items-center xs:text-sm md:text-[16px] !bg-blue-600  hover:!bg-blue-800 xsm:!p-2 xsl:text-lg xsl:!px-4 2xl:!text-xl`}
                onClick={clearClosedTickets}
              >
                Clear All
              </button>
            )}

            <div
              className="w-fit p-2 bg-gradient-to-r xs:text-[20px] from-purple-900 via-blue-600 to-blue-800  text-white rounded-lg font-medium hover:opacity-90 flex items-center gap-2 px-3 hover:cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              <MessageCircleQuestionMark /> <span>Open a ticket</span>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className=" xs:px-5 xs:-mt-40 2xs:-mt-20   relative text-lg max-w-3xl bg-[#0b112d] xs:w-[90%] nsl:w-[85%] nsl:p-10 sm:p-15 md:w-[70%] lg:p-20 2lg:mt-10 shadow-lg border border-[#1b254b]">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-purple-900 via-blue-600 to-blue-800 rounded-lg hover:opacity-90 flex items-center justify-center"
              >
                <div className="absolute w-[90%] h-[90%] bg-[#0b112d] rounded-lg flex items-center justify-center">
                  <XIcon className="text-blue-600 font-bold w-6 h-6" />
                </div>
              </button>

              <form
                onSubmit={handleSubmit}
                className="space-y-8 mt-10 xs:text-[22px] 2xs:text-[20px] nsl:text-[18px] lg:text-[20px]"
              >
                {/* Admission No */}
                <div>
                  <label className="block  text-md font-medium text-gray-300 mb-2">
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
                  {containSpecialCharacter && (
                    <p className="text-red-500 ">
                      Admission no. cannot contain special characters
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
                <div className="xs:w-full w-[40%] mx-auto mt-8">
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
            <div className="xs:px-5 xs:py-10 xs:-mt-40 2xs:-mt-20   relative text-lg max-w-3xl bg-[#0b112d] xs:w-[90%] nsl:w-[85%] nsl:p-10 sm:p-15 md:w-[70%] lg:p-20 2lg:mt-10 shadow-lg border border-[#1b254b]">
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
