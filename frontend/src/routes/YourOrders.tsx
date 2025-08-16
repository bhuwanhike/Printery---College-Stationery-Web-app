import { useEffect, useState } from "react";
import { OctagonAlert, CircleCheckBig } from "lucide-react";

type orderedFile = {
  ref_FileId: string;
  qty: number;
  status: string;
  name: string;
  branch: string;
  subject_code: string;
  year: number;
  createdAt: string;
  updatedAt: string;
};

const YourOrders = () => {
  const [orderedFiles, setOrderedFiles] = useState<orderedFile[]>([]);
  const getOrderedFiles = async () => {
    try {
      const res = await fetch("http://localhost:3000/order-practical-files", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      setOrderedFiles(data.finalOrders);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    const res = async () => {
      await getOrderedFiles();
    };
    res();
  }, []);

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
      file.branch.toLowerCase().includes(searchDepartment.toLowerCase());

    const matchesCode =
      searchCode === "" ||
      file.subject_code.toLowerCase().includes(searchCode.toLowerCase());

    const matchesYear = searchYear === "" || file.year === Number(searchYear);

    return matchesName && matchesDepartment && matchesCode && matchesYear;
  });

  const [isCompleted, setIsCompleted] = useState(false);
  return (
    <div className="mx-auto w-[70%] h-full bg-[#0b112d] rounded-2xl p-8 shadow-lg border border-[#1b254b] my-30 px-20 flex flex-col gap-20 ">
      <>{console.log(orderedFiles)}</>
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
            <div className="w-1/6 text-center">Status</div>
          </div>
          <div className="flex flex-col w-[100%] mx-auto">
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file, index) => (
                <div
                  className="flex items-center border-b border-gray-800 w-[100%] mx-auto py-2 px-4 justify-center"
                  key={index}
                >
                  <div className="w-1/6 flex items-center justify-start px-4">
                    {file.subject_code}
                  </div>

                  <div className="w-2/6 flex items-center justify-start px-4 truncate">
                    {file.name}
                  </div>

                  <div className="w-1/6 flex items-center justify-center ">
                    {file.branch}
                  </div>
                  <div className="w-1/6 flex items-center justify-center ">
                    {file.year}
                  </div>

                  <div className="w-1/6 flex justify-center items-center">
                    {file.qty}
                  </div>
                  <div className="w-1/6 flex justify-center items-center">
                    {isCompleted ? (
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
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                No files found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourOrders;
