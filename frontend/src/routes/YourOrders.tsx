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
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/order-practical-files`,
        {
          method: "GET",
          credentials: "include",
        }
      );
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
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/order-practical-files/${_id}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

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
        fetch(
          `${import.meta.env.VITE_BACKEND_URL}/order-practical-files/deleteAll`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ ids: completedIds }), // 👈 send array
          }
        );
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
    <div className="xs:min-w-[95%] xs:my-[10vh] 2xs:my-[12vh]  xsm:my-[12vh] nsl:my-[16vh] nsl:min-w-[85%] sm:min-w-[80%] sm:!p-12  md:min-w-[75%] md:my-45 xl:my-50  mx-auto bg-[#0b112d] w-[70%] h-full rounded-2xl xs:p-8 shadow-lg border border-[#1b254b] px-20 flex flex-col items-center justify-center xs:gap-15 gap-20 2xl:my-60  ">
      <div className="xs:p-0 py-10 px-10 w-full">
        <p className="xs:text-[19px] xsm:text-[22px] lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-white">
          Your Orders
        </p>

        <hr className="xs:w-full xs:my-2 md:my-3 xsm:my-1 border-1 border-transparent xs:h-[3px] h-1 xs:min-w-[75vw]  bg-gradient-to-r from-red-600 to-blue-600 sm:min-w-[90%] md:min-w-[62vw] " />

        <div className="flex flex-col items-center gap-10 2xl:my-10">
          {/* Search and Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4 border  border-gray-600 rounded-lg  mb-2 mt-4 2xl:w-[60vw]">
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

          <div className="flex flex-col w-[100%] text-gray-300 justify-center xs:overflow-x-scroll 2lg:overflow-x-hidden">
            <div className="flex xs:w-[400vw] 2xs:w-[300vw] xxs:w-[250vw] xsm:w-[200vw] xsl:w-[180vw]  nsl:mx-3 nsl:w-[150vw] sm:w-[150vw] md:mx-9 md:w-[100vw] xs:text-[20px]  lg:w-[80vw] lg:mx-auto 2lg:w-[100%]  border-b border-gray-700 font-semibold xs:px-1 items-center py-2 justify-center bg-gray-700 nsl:text-[15px] rounded-sm  sm:text-[15px] sm:mb-4 2xl:w-[60vw] 2xl:text-lg">
              <div className="w-2/6 text-center">File Code</div>
              <div className="w-2/6 text-center">File Name</div>
              <div className="w-2/6 text-center">Branch</div>
              <div className="w-1/6 text-center">Year</div>
              <div className="w-1/6 text-center">Qty</div>
              <div className="w-2/6 text-center">Status</div>
            </div>
            <div className="flex flex-col w-[100%] mx-auto">
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file, index) => (
                  <div
                    className="flex xs:w-[400vw]  2xs:w-[300vw] xxs:w-[250vw] xsl:w-[180vw] xsm:w-[200vw] nsl:mx-3 nsl:w-[150vw] sm:w-[150vw] md:mx-9 md:w-[100vw] xs:mt-3 lg:w-[80vw] lg:mx-auto 2lg:w-[100%] border-b border-gray-700 font-semibold xs:px-0 px-4 py-2 justify-center items-center 2xl:w-[60vw]"
                    key={index}
                  >
                    <div className="w-2/6 flex items-center  xs:justify-center ">
                      <span className="">{file.subject_code}</span>
                    </div>

                    <div className="w-2/6 flex items-center  xs:justify-center xs:pl-4  sm:justify-start truncate ">
                      <span className="w-[90%] truncate">{file.name}</span>
                    </div>

                    <div className="w-2/6 flex items-center  xs:justify-center">
                      {file.department}
                    </div>

                    <div className="w-1/6 flex items-center  xs:justify-center">
                      {file.year}
                    </div>

                    <div className="w-1/6 flex items-center  xs:justify-center">
                      {file.qty}
                    </div>

                    <div
                      className={`w-2/6 flex justify-center items-center xs:gap-2  gap-4`}
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
                          className="flex items-center xs:!px-3 xs:!py-3 xs:text-sm md:!px-2 md:!py-2 justify-center xs:gap-1 gap-2  !text-md font-bold text-white !bg-red-800   hover:!bg-red-700/30 "
                          onClick={() => deleteSelectedOrder(file._id)}
                        >
                          <Trash2 className="xs:w-6 xs:h-6 xsm:w-5 xsm:h-5 md:w-6 md:h-6 " />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="xs:mt-4 xs:text-[20px] xxs:mt-8 text-gray-300 flex items-center justify-center xsl:text-[16px] xsl:py-8 xsm:text-[15px] 2xl:text-xl">
                  No files found
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          {allOrderesCompleted && filteredFiles.length > 0 && (
            <button
              className="xs:mt-4 xs:!p-3 flex xs:text-[20px] flex-col items-center xs:text-sm md:text-[16px] md:mt-6 !bg-blue-600  hover:!bg-blue-800 xsm:!p-2 xsl:text-lg xsl:!px-4 2xl:!text-xl"
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
