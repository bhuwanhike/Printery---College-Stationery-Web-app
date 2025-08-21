import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useUser } from "../context/useUser";

import Alert from "@mui/material/Alert";

const Years = [{ year: 1 }, { year: 2 }, { year: 3 }, { year: 4 }];

type practicalFile = {
  _id: string;
  name: string;
  year: number;
  department: string;
  subject_code: string;
};

type orderedFile = {
  userId: string;
  ref_FileId: string;
  qty: number;
  status: string;
};

const SemesterFileContent = ({
  activeCard,
  setActiveCard,
}: {
  activeCard: number | null;
  setActiveCard: React.Dispatch<React.SetStateAction<number | null>>;
}) => {
  const { userID } = useUser();
  const [practicalFiles, setPracticalFiles] = useState<practicalFile[]>([]);

  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchCode, setSearchCode] = useState("");

  const [orderedFiles, setOrderedFiles] = useState<orderedFile[]>([]);

  const [placeOrderFiles, setPlaceOrderFiles] = useState<orderedFile[]>([]);

  const [fileQuantities, setFileQuantities] = useState<{
    [id: string]: number;
  }>({});

  const filteredFiles = practicalFiles.filter((file) => {
    const matchesName = file.name
      .toLowerCase()
      .includes(searchName.toLowerCase());

    const matchesDepartment =
      searchDepartment === "" ||
      file.department.toLowerCase().includes(searchDepartment.toLowerCase());

    const matchesCode =
      searchCode === "" ||
      file.subject_code.toLowerCase().includes(searchCode.toLowerCase());

    return matchesName && matchesDepartment && matchesCode;
  });

  const fetchPracticalFiles = async () => {
    try {
      const res = await fetch("http://localhost:3000/practical-files", {
        method: "GET",
        // credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setPracticalFiles(data);

      const qtyMap: { [id: string]: number } = {};
      const orders: orderedFile[] = [];

      data.forEach((file: practicalFile) => {
        qtyMap[file._id] = 1;
        orders.push({
          userId: userID!,
          ref_FileId: file._id,
          qty: 1,
          status: "pending",
        });
      });

      setFileQuantities(qtyMap);
      setOrderedFiles(orders);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    if (!userID) return;
    fetchPracticalFiles();
  }, [userID]);
  useEffect(() => {
    if (userID) {
      fetchPracticalFiles();
    }
  }, []);

  const handleQtyChange = (ref_FileId: string, newValue: number) => {
    if (newValue < 1) return;

    // Update quantities map
    setFileQuantities((prev) => ({
      ...prev,
      [ref_FileId]: newValue,
    }));

    // Update orderedFiles array
    setOrderedFiles((prev) =>
      prev.map((file) =>
        file.ref_FileId === ref_FileId ? { ...file, qty: newValue } : file
      )
    );
  };
  const [isProcessing, setIsProcessing] = useState<string[]>([]);

  const [showToast, setShowToast] = useState<string[]>([]);

  const placeOrder = (fileId: string) => {
    // Add this file to processing list
    setIsProcessing((prev) => [...prev, fileId]);

    setTimeout(() => {
      // Add the file to placed orders
      const fileToAdd = orderedFiles.find((file) => file.ref_FileId === fileId);
      if (fileToAdd) {
        setPlaceOrderFiles((prev) => {
          const existingFileIndex = prev.findIndex(
            (f) => f.ref_FileId === fileToAdd.ref_FileId
          );

          if (existingFileIndex !== -1) {
            const updated = [...prev];
            updated[existingFileIndex] = {
              ...updated[existingFileIndex],
              qty: updated[existingFileIndex].qty + fileToAdd.qty,
            };
            return updated;
          } else {
            return [...prev, fileToAdd];
          }
        });
      }

      setIsProcessing((prev) => prev.filter((id) => id !== fileId));
    }, 2000);
    setTimeout(() => {
      setShowToast((prev) => [...prev, fileId]);
    }, 2000);
    setTimeout(() => {
      setShowToast((prev) => prev.filter((id) => id !== fileId));
    }, 4000);
  };

  const confirmAndUpload = async () => {
    const fileData = new FormData();
    fileData.append("files", JSON.stringify(placeOrderFiles));
    // const sendOrder =
    await fetch("http://localhost:3000/order-practical-files", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",

      body: JSON.stringify(placeOrderFiles),
    });
    // console.log(placeOrderFiles);
    setPlaceOrderFiles([]);
  };
  return (
    <div className="flex flex-col items-center gap-10">
      {/* Search and Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border  border-gray-600 rounded-lg  mb-2 mt-4">
        <div>
          <label className="text-md text-gray-300">Name</label>
          <input
            type="text"
            placeholder="Search by name"
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C] text-white placeholder-gray-500"
          />
        </div>
        <div>
          <label className="text-md text-gray-300">Code</label>
          <input
            type="text"
            placeholder="Search by code"
            onChange={(e) => setSearchCode(e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C] text-white placeholder-gray-500"
          />
        </div>
        <div>
          <label className="text-md text-gray-300">Branch</label>
          <select
            className={`w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C]  appearance-none 
                ${searchDepartment === "" ? "!text-gray-500" : "!text-white"}`}
            defaultValue=""
            onChange={(e) => setSearchDepartment(e.target.value)}
          >
            <option value="" className="!text-gray-500">
              Select department
            </option>
            <option value="CS">CS</option>
            <option value="EEE">EEE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
            <option value="Common">Common</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col min-w-full text-gray-300 justify-center">
        <div className="flex border-b border-gray-700 w-[100%] mx-auto font-semibold  py-2 justify-center">
          <div className="w-1/4 text-center">File Code</div>
          <div className="w-2/4 text-center">File Name</div>
          <div className="w-1/4 text-center">Branch</div>
          <div className="w-2/4 text-center">Qty</div>
          <div className="w-2/4 text-center">Place Order</div>
        </div>
        <div className="flex flex-col w-[100%] mx-auto">
          {filteredFiles
            .filter((file) => file.year === activeCard)
            .map((file, index) => (
              <div
                className="flex items-center border-b border-gray-800 w-[100%] mx-auto py-2 px-4 justify-center"
                key={index}
              >
                <div className="w-1/4 flex items-center gap-4  justify-center">
                  <span className="w-[80%] truncate">{file.subject_code}</span>
                </div>

                <div className="w-2/4 flex items-center gap-4  justify-center ">
                  <span className="w-[80%] truncate">{file.name}</span>
                </div>

                <div className="w-1/4 flex items-center gap-4  justify-center ">
                  {file.department}
                </div>

                <div className="w-2/4 flex justify-center items-center">
                  <div className="flex items-center border-2 border-yellow-400 rounded-md">
                    <button
                      className="px-3 py-1 text-lg font-bold text-white !bg-transparent hover:!bg-yellow-600/30 hover:!rounded-full "
                      onClick={() =>
                        handleQtyChange(
                          file._id,
                          (fileQuantities[file._id] || 1) - 1
                        )
                      }
                    >
                      −
                    </button>
                    <span className="px-3 py-1 border-yellow-400 text-yellow-400 text-xl">
                      {fileQuantities[file._id] || 1}
                    </span>
                    <button
                      className="px-3 py-1 text-lg font-bold text-white !bg-transparent hover:!bg-yellow-600/30 hover:!rounded-full"
                      onClick={() =>
                        handleQtyChange(
                          file._id,
                          (fileQuantities[file._id] || 1) + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="w-2/4 flex items-center gap-4 justify-center">
                  <button
                    className={`px-3 py-1 !text-lg !font-bold !text-white !bg-blue-600 hover:!bg-blue-600/30 ${
                      showToast.includes(file._id) ? "hidden" : ""
                    } ${
                      isProcessing.includes(file._id)
                        ? "!bg-blue-900"
                        : "!bg-blue-600"
                    }`}
                    onClick={() => placeOrder(file._id)}
                    disabled={isProcessing.includes(file._id)}
                  >
                    {isProcessing.includes(file._id)
                      ? "Processing..."
                      : "Place Order"}
                  </button>
                  {showToast.includes(file._id) && (
                    <Alert variant="outlined" className="!text-green-500">
                      In queue
                    </Alert>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
      {placeOrderFiles.length > 0 && isProcessing.length === 0 && (
        <button
          className={`px-3 py-1 !text-lg !font-bold !text-white !bg-blue-600 hover:!bg-blue-600/30  ${
            placeOrderFiles.length > 0 ? "block" : "hidden"
          }`}
          onClick={confirmAndUpload}
        >
          Confirm and Pay
        </button>
      )}
    </div>
  );
};

const Orderfiles = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [preservedCardState, setPreservedCardState] = useState<number | null>(
    null
  );
  return (
    <div className="mx-auto w-[70%] h-full bg-[#0b112d] rounded-2xl p-8 shadow-lg border border-[#1b254b] my-30 px-20 flex flex-col gap-20 ">
      <div className=" py-10 px-10 w-full">
        <div className="navigation flex items-center gap-6 justify-between">
          <div className="flex items-center gap-8">
            <button
              className="cursor-pointer hover:!opacity-80 !bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 !rounded-full !p-2 flex items-center justify-center"
              onClick={() => setActiveCard(null)}
            >
              {" "}
              <ArrowLeft />
            </button>
            <p className="text-3xl font-bold text-white">
              {activeCard ? "Order Practical Files" : "Practical Files"}
            </p>
          </div>
          <button
            className="cursor-pointer hover:!opacity-80 !bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 !rounded-full !p-2 flex items-center justify-center"
            onClick={() => setActiveCard(preservedCardState)}
          >
            {" "}
            <ArrowRight />
          </button>
        </div>

        <hr className="my-5 border-1 border-transparent h-1 w-[100%] mx-auto bg-gradient-to-r from-red-600 to-blue-600" />

        {activeCard === null && (
          <div className="mt-10 grid grid-cols-2 gap-8 justify-center items-center px-20 py-10">
            {Years.map((year, index) => (
              <motion.div
                className="relative p-[1px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 !rounded-3xl hover:cursor-pointer"
                key={index}
                initial={{ y: 0 }}
                whileHover={{
                  y: -5,
                  scale: 1.05,
                  transition: { duration: 0.2 },
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <button
                  className="relative flex flex-col items-center justify-center w-full h-80 !bg-gray-900 !rounded-3xl !overflow-hidden "
                  style={{ width: "calc(100% - 2px)", margin: "1px" }}
                  onClick={() => {
                    setPreservedCardState(index + 1);
                    setActiveCard(index + 1);
                  }}
                >
                  <span className="relative z-10 text-white text-2xl">
                    Year - {year.year}
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {activeCard !== null && (
          <SemesterFileContent
            activeCard={activeCard}
            setActiveCard={setActiveCard}
          />
        )}
      </div>
    </div>
  );
};

export default Orderfiles;
