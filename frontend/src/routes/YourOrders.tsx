import { useCallback, useEffect, useState } from "react";
import { OctagonAlert, CircleCheckBig, Trash2 } from "lucide-react";

type orderedFile = {
  _id: string;
  ref_FileId: string;
  qty: number;
  status: string;
  name: string;
  department: string;
  subject_code: string;
  year: number;
  deletedByUser: boolean;
  createdAt: string;
  updatedAt: string;
};

const YourOrders = () => {
  const [allOrderesCompleted, setAllOrderesCompleted] = useState(false);
  const [orderedFiles, setOrderedFiles] = useState<orderedFile[]>([]);
  const getOrderedFiles = async () => {
    try {
      const res = await fetch("http://localhost:3000/order-practical-files", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      data.finalOrders.forEach((file: orderedFile) => {
        if (file.status === "completed") {
          setAllOrderesCompleted(true);
        } else {
          setAllOrderesCompleted(false);
        }
      });

      // Get removed IDs from localStorage
      const removedOrderedFiles: string[] = JSON.parse(
        localStorage.getItem("removedOrderedFiles") || "[]"
      );

      // Filter out removed files
      const filteredData = data.finalOrders.filter(
        (file: { _id: string }) => !removedOrderedFiles.includes(file._id)
      );

      setOrderedFiles(filteredData);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };
  const deleteSelectedOrder = useCallback(async (_id: string) => {
    try {
      await fetch(`http://localhost:3000/order-practical-files/${_id}`, {
        method: "PUT",
        credentials: "include",
      });

      setOrderedFiles((prev) => prev.filter((file) => file._id !== _id));

      const removedOrderedFiles = new Set(
        JSON.parse(localStorage.getItem("removedOrderedFiles") || "[]")
      );

      removedOrderedFiles.add(_id);

      localStorage.setItem(
        "removedOrderedFiles",
        JSON.stringify(Array.from(removedOrderedFiles))
      );
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }, []);

  const clearAllOrderedFiles = useCallback(async () => {
    setOrderedFiles((prev) => {
      // collect IDs of completed files
      const completedIds = prev
        .filter((file) => file.status === "completed")
        .map((file) => file._id);
      console.log(completedIds);

      if (completedIds.length > 0) {
        // send all completed IDs to backend in one request
        fetch("http://localhost:3000/order-practical-files/deleteAll", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ ids: completedIds }), // 👈 send array
        });
      }

      // also store them locally (to persist across refresh)
      const removedIds: string[] = JSON.parse(
        localStorage.getItem("removedOrderedFiles") || "[]"
      );
      localStorage.setItem(
        "removedOrderedFiles",
        JSON.stringify([...new Set([...removedIds, ...completedIds])])
      );

      // return only non-completed files
      return prev.filter((file) => file.status !== "completed");
    });
    setAllOrderesCompleted(false);
  }, []);

  useEffect(() => {
    getOrderedFiles();
  }, [deleteSelectedOrder, clearAllOrderedFiles]);

  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchYear, setSearchYear] = useState("");

  const filteredFiles = orderedFiles.filter((file) => {
    const matchesName = file.name
      .toLowerCase()
      .includes(searchName.toLowerCase());

    const matchesDepartment =
      searchDepartment === "" ||
      file.department.toLowerCase().includes(searchDepartment.toLowerCase());

    const matchesCode =
      searchCode === "" ||
      file.subject_code.toLowerCase().includes(searchCode.toLowerCase());

    const matchesYear = searchYear === "" || file.year === Number(searchYear);

    return matchesName && matchesDepartment && matchesCode && matchesYear;
  });

  return (
    <div className="mx-auto w-[70%] h-full bg-[#0b112d] rounded-2xl p-8 shadow-lg border border-[#1b254b] my-30 px-20 flex flex-col gap-20 ">
      <div className="py-10 px-10 w-full">
        <p className="text-3xl font-bold text-white pl-8">Your Orders</p>

        <hr className="my-5 border-1 border-transparent h-1 w-[100%] mx-auto bg-gradient-to-r from-red-600 to-blue-600" />

        <div className="flex flex-col items-center gap-10 py-10 px-10">
          {/* Search and Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border  border-gray-600 rounded-lg  mb-2 mt-4">
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
                ${searchDepartment === "" ? "!text-gray-500" : "!text-white"}
                        `}
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
            <div>
              <label className="text-md text-gray-300">Year</label>
              <select
                className={`w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#10182C]  appearance-none 
                ${searchDepartment === "" ? "!text-gray-500" : "!text-white"}
                        `}
                defaultValue=""
                onChange={(e) => setSearchYear(e.target.value)}
              >
                <option value="" className="!text-gray-500">
                  Select year
                </option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col min-w-full text-gray-300 justify-center">
            <div className="flex border-b border-gray-700 w-[100%] mx-auto font-semibold  py-2 justify-center">
              <div className="w-1/6 text-center">File Code</div>
              <div className="w-2/6 text-center">File Name</div>
              <div className="w-1/6 text-center">Branch</div>
              <div className="w-1/6 text-center">Year</div>
              <div className="w-1/6 text-center">Qty</div>
              <div className="w-2/6 text-center">Status</div>
            </div>
            <div className="flex flex-col w-[100%] mx-auto">
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file, index) => (
                  <div
                    className="flex items-center border-b border-gray-800 w-[100%] mx-auto py-2  justify-center"
                    key={index}
                  >
                    <div className="w-1/6 flex items-center justify-center ">
                      {file.subject_code}
                    </div>

                    <div className="w-2/6 flex items-center justify-start truncate">
                      {file.name}
                    </div>

                    <div className="w-1/6 flex items-center justify-center ">
                      {file.department}
                    </div>
                    <div className="w-1/6 flex items-center justify-center ">
                      {file.year}
                    </div>

                    <div className="w-1/6 flex justify-center items-center">
                      {file.qty}
                    </div>
                    <div
                      className={`w-2/6 flex justify-center items-center gap-4`}
                    >
                      {file.status === "completed" ? (
                        <div className="flex items-center gap-2">
                          <CircleCheckBig className="w-5 h-5 text-green-500" />
                          Completed
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <OctagonAlert className="w-5 h-5 text-red-500" />
                          Pending
                        </div>
                      )}
                      {file.status === "completed" && (
                        <button
                          className="flex items-center justify-center !text-white !bg-red-800 !py-2 rounded-lg hover:!bg-red-700/70"
                          onClick={() => deleteSelectedOrder(file._id)}
                        >
                          <Trash2 className="h-5 w-5 " />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center w-full h-full mt-8">
                  No files found
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          {allOrderesCompleted && filteredFiles.length > 0 && (
            <button
              className="!bg-blue-600 !p-2 hover:!bg-blue-800 "
              onClick={clearAllOrderedFiles}
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default YourOrders;
