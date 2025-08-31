import React, { useEffect, useRef, useState, useCallback } from "react";
import { PlusIcon, MinusIcon } from "lucide-react";
import { File, OctagonAlert, CircleCheckBig, Trash2, X } from "lucide-react";
import { useUser } from "../context/useUser";

const pdfIcon = "https://placehold.co/40x40/737373/000000?text=PDF";
const fileIcon = "https://placehold.co/40x40/737373/000000?text=FILE";

type FileOBJ = {
  fileObject: File;
  fileType: string;
  imgUrl: string;
  name: string;
  isBlackWhite: boolean;
  isColored: boolean;
  status: string;

  qty: number;
  deletedByUser: boolean;
  userId: string;
};
type FileOBJ2 = {
  fileObject: File;
  fileType: string;
  url: string;
  filename: string;
  isColored: boolean;
  status: string;
  qty: number;
  deletedByUser: boolean;
  userId: string;
  _id: string;
  publicId: string;
};

const Dashboard = () => {
  const { userID } = useUser();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTab, setSelectedTab] = useState<
    "pending" | "completed" | "upload"
  >("upload");

  const [uploadableFiles, setUploadableFiles] = useState<FileOBJ[]>([]);
  const [pendingTabFiles, setPendingTabFiles] = useState<FileOBJ2[]>([]);
  const [completedTabFiles, setCompletedTabFiles] = useState<FileOBJ2[]>([]);

  const handleQtyChange = (index: number, value: number) => {
    if (value < 1) return;
    const updatedFiles = [...uploadableFiles];
    updatedFiles[index].qty = value;
    setUploadableFiles(updatedFiles);
  };

  const getPreviewForFile = (file: FileOBJ) => {
    if (file.fileType?.startsWith("image/")) {
      return file.imgUrl;
    }
    if (file.fileType?.startsWith("application/pdf")) {
      return pdfIcon;
    }
    return fileIcon;
  };

  const [pendingSelection, setPendingSelection] = useState<File[]>([]);
  const [pendingPreviewUrls, setPendingPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newPreviews = filesArray.map((file) =>
        file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : file.type.startsWith("application/pdf")
          ? pdfIcon
          : fileIcon
      );

      setPendingSelection((prev) => [...prev, ...filesArray]);
      setPendingPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const handlePrintTypeChange = (
    index: number,
    field: string,
    value: boolean
  ) => {
    const updatedFiles = [...uploadableFiles];
    if (value) {
      if (field === "isBlackWhite") {
        updatedFiles[index].isBlackWhite = true;
        updatedFiles[index].isColored = false;
      } else {
        updatedFiles[index].isColored = true;
        updatedFiles[index].isBlackWhite = false;
      }
    }
    setUploadableFiles(updatedFiles);
  };

  const handleRemovePendingImage = (index: number) => {
    setPendingSelection((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current && pendingSelection.length === 1) {
      fileInputRef.current.value = "";
    }
  };

  const deleteSelectedFile = useCallback(async (_id: string) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ _id }),
      });
      setCompletedTabFiles((prev) => prev.filter((file) => file._id !== _id));

      const removedPrintFiles = new Set(
        JSON.parse(localStorage.getItem("removedPrintFiles") || "[]")
      );

      removedPrintFiles.add(_id);

      localStorage.setItem(
        "removedPrintFiles",
        JSON.stringify(Array.from(removedPrintFiles))
      );
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }, []);

  const clearAllFiles = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/upload/delete-all-files`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to clear files");

      // remove locally too
      const removedIds: string[] = JSON.parse(
        localStorage.getItem("removedPrintFiles") || "[]"
      );

      const closedIds = completedTabFiles.map((file) => file._id); // 👈 gather IDs

      localStorage.setItem(
        "removedPrintFiles",
        JSON.stringify([...new Set([...removedIds, ...closedIds])])
      );

      setCompletedTabFiles([]);
    } catch (error) {
      console.error("Error clearing files:", error);
    }
  }, [completedTabFiles]);
  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/uploadableFiles-DB`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();

      const filteredData = data.filter(
        (file: FileOBJ2) => file.userId === userID
      );

      setPendingTabFiles([
        ...filteredData.filter((file: FileOBJ2) => file.status === "pending"),
      ]);
      setCompletedTabFiles([
        ...filteredData.filter(
          (file: FileOBJ2) =>
            file.status === "completed" && file.deletedByUser === false
        ),
      ]);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, [userID]);

  const confirmUploads = () => {
    const newFilesData = pendingSelection.map((file) => ({
      fileObject: file,
      fileType: file.type,
      imgUrl: URL.createObjectURL(file),
      name: file.name,
      isBlackWhite: false,
      isColored: false,

      deletedByUser: false,
      status: "pending",
      qty: 1,
      userId: userID!,
    }));

    setUploadableFiles((prev) => [...prev, ...newFilesData]);

    setPendingSelection([]);
    setPendingPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = useCallback(async () => {
    if (uploadableFiles.length === 0) {
      alert("Please add files to upload first.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();

    uploadableFiles.forEach((file) => {
      // Send the actual file
      formData.append("files", file.fileObject);

      // Send metadata fields
      formData.append("isColored", file.isColored.toString());
      formData.append("status", file.status);
      formData.append("qty", file.qty.toString());
      formData.append("name", file.name);
    });

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();
    setIsUploading(false);

    setUploadableFiles([]);

    setPendingTabFiles((prev) => [
      ...prev,
      data.fileData.filter((file: FileOBJ2) => file.status === "pending"),
    ]);
    setCompletedTabFiles((prev) => [
      ...prev,
      data.fileData.filter((file: FileOBJ2) => file.status === "completed"),
    ]);
  }, [uploadableFiles]);

  useEffect(() => {
    if (!userID) return;
    fetchFiles();
  }, [userID, fetchFiles, deleteSelectedFile, clearAllFiles, handleUpload]);

  const handleCancel = (index: number) => {
    const updatedFiles = [...uploadableFiles];
    updatedFiles.splice(index, 1);
    setUploadableFiles(updatedFiles);
  };

  return (
    <div className="xs:min-w-[95%] xs:my-[10vh] 2xs:my-[12vh]  xsm:my-[12vh] nsl:my-[16vh] nsl:min-w-[85%] sm:min-w-[80%] sm:!p-12  md:min-w-[75%] md:my-45 xl:my-50  mx-auto bg-[#0b112d] w-[70%] h-full rounded-2xl xs:p-8 shadow-lg border border-[#1b254b] px-20 flex flex-col items-center justify-center xs:gap-15 gap-20 2xl:my-60">
      <div className="flex flex-col  items-center justify-center ">
        <div className="file-system xs:overflow-x-scroll scroll-hidden xs:min-w-[90vw]  xs:p-3 2xs:min-w-[80vw]  xxs:min-w-[80vw] xsl:min-w-[65vw] xsl:h-80  xs:h-60 xs:mt-4 sm:min-w-[55vw] md:min-w-[50vw] md:mt-8  lg:h-100  border-2 w-[50%] h-90 mt-8  border-dashed  border-gray-600 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition relative">
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg, .pdf"
            disabled={isUploading || selectedTab !== "upload"}
            multiple
          />

          {pendingPreviewUrls.length > 0 ? (
            <div className=" relative xs:px-18 p-4 xs:min-w-[120vw]  xs:gap-18 2xs:gap-10 xxs:gap-0 xsm:min-w-[90vw] xsm:px-8 xsm:gap-4 xsl:min-w-[65vw] md:min-w-[55vw] xsl:p-6 sm:px-12 sm:gap-4 w-full h-full grid xs:grid-cols-2 xsm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 xsm:py-4 xsl:gap-12 grid-cols-3  items-start gap-4 justify-start overflow-y-auto scroll-hidden 2xl:p-10 2xl:px-18 2xl:gap-8">
              {pendingPreviewUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group  flex flex-col items-center justify-start gap-2"
                >
                  <button
                    type="button"
                    aria-label="Remove image"
                    className="absolute xs:-top-[1vw]  xs:-right-[7vw] xs:w-[4px] xs:!h-[26px] 2xs:-top-[2px] 2xs:-right-[2px] xxs:-top-[4px] xxs:right-[20px] xsm:-top-[6px] xsm:-right-[2px] md:!w-2 md:!h-2 !bg-red-700 xsl:-right-4 md:-top-2 md:-right-4   -top-2 -right-2 z-10 hover:!bg-red-600/90 text-white rounded-full flex items-center justify-center text-base shadow-md opacity-90 group-hover:opacity-100 font-bold 2xl:!text-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePendingImage(idx);
                    }}
                    tabIndex={0}
                  >
                    &times;
                  </button>
                  <div className="flex flex-col items-center justify-center xs:w-18 xs:h-18 w-30 h-50 border-1 rounded-md border-gray-700 shadow 2xl:w-32 2xl:h-32">
                    <img
                      src={url}
                      alt={`Selected preview ${idx + 1}`}
                      className="flex items-center justify-center xs:object-contain object-contain w-full h-full rounded-md"
                    />
                  </div>
                  <p className="xs:text-sm xs:w-[100px] mt-1 text-gray-300  w-[100px] xsl:w-[70px] xsm:w-[80px]  text-center  break-words xsl:truncate-2 md:text-start 2xl:w-[100px] 2xl:text-lg">
                    {pendingSelection[idx]?.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <>
              <File className="xs:w-14 xs:h-14 w-18 h-18 text-gray-400 mb-2 pointer-events-none md:w-20 md:h-20 " />
              <p className="xs:text-sm xs:text-center font-semibold text-gray-300 pointer-events-none md:text-[16px] 2xl:text-lg">
                Drag and drop files here
              </p>
              <p className="text-sm text-gray-500 pointer-events-none 2xl:text-lg">
                .png, .jpg, .jpeg, .pdf
              </p>
              {
                <div
                  className={`xs:text-sm text-lg text-red-500 pointer-events-none mt-3 sm:text-[16px] 2xl:text-lg ${
                    selectedTab === "pending" || selectedTab === "completed"
                      ? "block"
                      : "hidden"
                  }`}
                >
                  Go to{" "}
                  <span className="xs:text-sm text-yellow-600 font-bold sm:text-[16px] 2xl:text-lg">
                    Upload
                  </span>{" "}
                  tab first
                </div>
              }
            </>
          )}
        </div>
        {pendingPreviewUrls.length > 0 && (
          <button
            className="xs:w-[90vw] 2xs:w-[80vw] xxs:w-[80vw] xsl:w-[80%] nsl:w-[88%] xsl:mt-9 sm:w-[55vw] xs:text-sm xs:h-10 xs:mt-6  md:mt-8 md:w-[50vw] md:h-12  lg:mt-10    w-[50%]  py-2 bg-gradient-to-r from-purple-900 via-blue-600 to-blue-800  text-white font-bold rounded-md mt-4 "
            onClick={confirmUploads}
          >
            Add to Print Queue
          </button>
        )}
      </div>

      <div className="flex flex-col  items-center xs:w-70  xxs:w-[75vw]">
        <div className="flex xs:gap-2 xs:min-w-full xs:justify-center xxs:justify-start xxs:mt-10 xsl:mt-8 sm:mt-14 md:mt-16 md:min-w-[90%] xsm:text-lg nsl:px-4 2xl:px-14 2xl:text-2xl">
          <button
            onClick={() => setSelectedTab("upload")}
            className={`xs:!px-2 xs:!py-1 xs:text-sm xsl:text-lg xsl:!p-2 xsl:!px-3 px-4 py-2 rounded-lg hover:!bg-gradient-to-r from-yellow-600 to-yellow-800 transition-all duration-200 hover:!text-white ${
              selectedTab === "upload"
                ? "!border-yellow-400  text-yellow-400 !bg-transparent"
                : "!border-gray-400 text-gray-300 !bg-transparent"
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setSelectedTab("pending")}
            className={`xs:!px-2 xs:!py-1 xs:text-sm xsl:text-lg xsl:!p-2 xsl:!px-3 px-4 py-2 rounded-lg hover:!bg-gradient-to-r from-red-500 to-red-800 transition-all duration-200 hover:!text-white  ${
              selectedTab === "pending"
                ? "!border-red-600  text-red-600 !bg-transparent"
                : "!border-gray-400 text-gray-300 !bg-transparent"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setSelectedTab("completed")}
            className={`xs:!px-2 xs:!py-1 xs:text-sm xsl:text-lg xsl:!p-2 xsl:!px-3 px-4 py-2 rounded-lg hover:!bg-gradient-to-r from-green-600 to-green-900 transition-all hover:!text-white duration-200 ${
              selectedTab === "completed"
                ? "!border-green-400 text-green-400 !bg-transparent"
                : "!border-gray-400 text-gray-300 !bg-transparent"
            }`}
          >
            Completed
          </button>
        </div>

        <hr className=" xs:my-4 my-5 border-1 border-transparent xs:h-[3px] h-1 xs:w-[75vw] nsl:w-[70vw]  bg-gradient-to-r from-red-600 to-blue-600 md:w-[64vw] 2xl:w-[60vw]" />

        <div className=" xs:w-[98%] xs:mt-3 mt-10 flex flex-col  xs:overflow-x-scroll lg:overflow-hidden">
          {selectedTab === "upload" && (
            <div className=" flex flex-col items-center gap-10 ">
              <div className=" w-full flex flex-col  text-gray-300 justify-center ">
                <div className=" flex xs:w-[270vw] 2xs:w-[200vw] xxs:w-[150vw] xsm:w-[130vw] xsl:w-[120vw]  nsl:mx-3 nsl:w-[100vw] sm:w-[90vw] md:mx-9 md:w-[80vw] xs:text-[20px]  lg:w-[64vw] lg:mx-auto  border-b border-gray-700 font-semibold xs:px-1 items-center py-2 justify-center bg-gray-700 nsl:text-[15px] rounded-sm  sm:text-[15px] sm:mb-4 2xl:w-[60vw] 2xl:text-lg ">
                  <div className="w-2/4 text-center ">File</div>
                  <div className="w-2/4  text-center ">B-W / Colored</div>
                  <div className="w-2/4 text-center   ">Qty.</div>
                  <div className="w-2/4 text-center ">Amount</div>
                </div>
                <div className="flex flex-col w-[100%]">
                  {uploadableFiles.length > 0 ? (
                    uploadableFiles.map((file: FileOBJ, index) => (
                      <div
                        key={index}
                        className="flex xs:w-[270vw]  2xs:w-[200vw] xxs:w-[150vw] xsl:w-[120vw] xsm:w-[130vw] nsl:mx-3 nsl:w-[100vw] sm:w-[90vw] md:mx-9 md:w-[80vw] xs:mt-3 lg:w-[64vw] lg:mx-auto border-b border-gray-700 font-semibold xs:px-0 px-4 py-2 justify-center items-center 2xl:w-[60vw]  "
                      >
                        <div className="w-2/4 flex items-center xl:gap-3  gap-4 xs:justify-center sm:justify-start px-1">
                          <div className="xs:w-[60px] xs:h-[60px] xxs:w-[40px] xxs:h-[40px] w-8 h-8 rounded-md sm:w-[6vw] sm:h-[6vw] xl:w-[4vw] xl:h-[4vw] lg:w-12 lg:h-12">
                            <img
                              src={getPreviewForFile(file)}
                              alt=""
                              className="w-full h-full object-cover"
                              onClick={() => window.open(file.imgUrl)}
                            />
                          </div>
                          <span className="truncate xs:w-[80px] xxs:w-[70px] xsm:w-[80px] xsl:w-[100px] 2lg:w-[120px] lg:w-[90px] 2xl:text-lg">
                            {file.name}
                          </span>
                        </div>

                        <div className="xs:w-2/4  sm:w-2/4 w-1/4 flex xs:flex-col items-center xs:items-start xs:pl-2 xsm:pl-4 xsl:gap-2 xs:gap-1 xsl:pl-6 md:pl-[4vw] md:gap-[5px] 2lg:pl-[3vw] lg:pl-[6vw] xl:flex-row xl:gap-4 xl:pl-[4vw] ">
                          <div className="flex  xs:gap-1  items-center justify-center gap-2">
                            <input
                              type="checkbox"
                              className="xs:w-5 xs:h-5 w-4 h-4 md:w-[18px] md:h-[18px] accent-blue-500"
                              checked={file.isBlackWhite}
                              onChange={(e) =>
                                handlePrintTypeChange(
                                  index,
                                  "isBlackWhite",
                                  e.target.checked
                                )
                              }
                            />
                            <span className="xs:text-[20px] text-gray-200 xsl:text-sm md:text-[15px] 2xl:text-lg">
                              B-W
                            </span>
                          </div>

                          <div className="flex xs:gap-1 items-center justify-center gap-2">
                            <input
                              type="checkbox"
                              className=" w-4 h-4 accent-blue-500 xs:w-5 xs:h-5 md:w-[18px] md:h-[18px]"
                              checked={file.isColored}
                              onChange={(e) =>
                                handlePrintTypeChange(
                                  index,
                                  "isColored",
                                  e.target.checked
                                )
                              }
                            />
                            <span className="xs:text-[20px] text-gray-200 xsl:text-sm md:text-[15px] 2xl:text-lg">
                              Colored
                            </span>
                          </div>
                        </div>

                        <div className="w-2/4 flex justify-center gap-4 ">
                          <div className="flex items-center border-2 border-yellow-400 xs:gap-1 rounded-md ">
                            <button
                              className="xs:!px-3 xs:!py-3 md:!px-2 lg:!px-3 lg:!py-2 px-3 py-1 xl:!px-3 xl:!py-3 font-bold text-white !bg-transparent hover:!bg-yellow-600/30 hover:!rounded-full "
                              onClick={() =>
                                handleQtyChange(index, file.qty - 1)
                              }
                            >
                              <MinusIcon className="xs:w-6 xsl:w-4 2xl:w-6" />
                            </button>
                            <span className="xs:!px-2 xs:!py-2 xs:text-[24px] px-3 py-1 border-yellow-400 text-yellow-400 xsl:text-lg text-xl 2xl:text-2xl">
                              {file.qty}
                            </span>
                            <button
                              className="xs:!px-3 xs:!py-3 md:!px-2 lg:!px-3 lg:!py-2 px-3 py-1 xl:!px-3 xl:!py-3 font-bold text-white !bg-transparent hover:!bg-yellow-600/30 hover:!rounded-full"
                              onClick={() =>
                                handleQtyChange(index, file.qty + 1)
                              }
                            >
                              <PlusIcon className="xs:w-6 xsl:w-4 2xl:w-6" />
                            </button>
                          </div>
                        </div>

                        <div className="w-2/4 flex items-center justify-center xs:gap-2  gap-4 ">
                          <div className="xs:w-[55%] w-[55%] xs:text-[24px] xsl:text-lg flex justify-end text-xl  2xl:text-3xl">
                            ₹{file.qty * (file.isColored ? 5 : 3)}
                          </div>
                          <div className="xs:w-[45%] w-[45%] flex justify-end ">
                            <button
                              className="flex items-center xs:!px-3 xs:!py-3 xs:text-sm md:!px-2 md:!py-2 justify-center xs:gap-1 gap-2  !text-md font-bold text-white !bg-red-800   hover:!bg-red-700/30 "
                              onClick={() => handleCancel(index)}
                            >
                              <Trash2 className="xs:w-6 xs:h-6 xsm:w-5 xsm:h-5 md:w-6 md:h-6 " />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="xs:mt-4 xs:text-[20px] xxs:mt-8 text-gray-300 flex items-center justify-center xsl:text-[16px] xsl:py-8 xsm:text-[15px]">
                      No files to upload!
                    </div>
                  )}
                </div>
              </div>

              {uploadableFiles.length > 0 && (
                <div className="flex xs:text-[20px] xs:mt-4 flex-col items-center xs:text-sm md:text-[16px] md:mt-6 2xl:text-xl">
                  <div>
                    Total Amount:{" "}
                    <span className="font-bold">
                      ₹
                      {uploadableFiles.reduce(
                        (acc, file) =>
                          acc + file.qty * (file.isColored ? 5 : 3),
                        0
                      )}
                    </span>
                  </div>
                  <button
                    onClick={handleUpload}
                    className="!px-6 !py-2 xs:!px-4  !bg-blue-500 text-white font-bold rounded-md xs:mt-2 mt-4 hover:!bg-blue-600"
                    disabled={isUploading || uploadableFiles.length === 0}
                  >
                    {isUploading ? "Uploading..." : "Pay and Upload"}
                  </button>
                </div>
              )}
            </div>
          )}
          {selectedTab !== "upload" && (
            <div className="flex flex-col items-center gap-10">
              <div className="w-full flex flex-col  text-gray-300 justify-center">
                <div className="flex xs:w-[320vw] 2xs:w-[240vw] xxs:w-[190vw] xsm:w-[140vw]  xsl:w-[150vw] nsl:w-[130vw] sm:ml-[3vw] sm:w-[100vw] xs:text-[20px] nsl:mx-3  sm:mx-4 md:mx-9 md:w-[80vw] lg:w-[64vw] lg:mx-auto   border-b border-gray-700 font-semibold xs:px-1 items-center px-4 py-2 justify-center bg-gray-700 nsl:text-[15px] nsl:ml-3 rounded-sm xsm:px-2 sm:text-[15px] sm:mb-4 2xl:w-[60vw] 2xl:text-lg  ">
                  <div className="xs:w-2/4 w-1/4 text-center sm:w-2/4">
                    File
                  </div>
                  <div className="xs:w-2/4 w-2/4 text-center">
                    B-W / Colored
                  </div>
                  <div className="xs:w-1/4  text-center">Qty.</div>
                  <div className=" w-2/4 text-center">Status</div>
                </div>
                <div className="flex flex-col w-[100%]">
                  {(selectedTab === "pending"
                    ? pendingTabFiles
                    : completedTabFiles
                  ).map((file, index) => (
                    <div
                      key={index}
                      className="flex xs:w-[320vw] 2xs:w-[240vw] xxs:w-[190vw] xsm:w-[140vw] xsl:w-[150vw] nsl:w-[130vw] sm:ml-[3vw] sm:w-[100vw] xs:mt-3 sm:mx-4 md:mx-9 md:w-[80vw] lg:w-[64vw] lg:mx-auto border-b border-gray-700 font-semibold xs:px-2 nsl:mx-3 px-4 py-2 justify-center items-center 2xl:w-[60vw] 2xl:text-lg "
                    >
                      <div className="w-2/4 sm:w-2/4 flex items-center xl:gap-3 gap-4 xs:justify-center sm:justify-start sm:px-1">
                        <div className="xs:w-[60px] xs:h-[60px] xxs:w-[40px] xxs:h-[40px] w-8 h-8 rounded-md sm:w-[6vw] sm:h-[6vw] xl:w-[4vw] xl:h-[4vw] lg:w-12 lg:h-12">
                          <img
                            src={
                              file.filename.endsWith(".pdf")
                                ? pdfIcon
                                : file.url
                            }
                            alt=""
                            className="w-full h-full object-cover"
                            onClick={() => window.open(file.url)}
                          />
                        </div>
                        <span className="truncate xs:w-[80px] xxs:w-[70px] xsm:w-[80px] xsl:w-[100px] 2lg:w-[120px] lg:w-[90px] xl:w-[150px] nxl:w-[170px] 2xl:text-lg">
                          {file.filename}
                        </span>
                      </div>

                      <div className="xs:w-2/4 w-1/4 flex xs:flex-col items-center xs:items-center xs:pl-2 xs:gap-1 gap-4 ">
                        <div className="flex xs:gap-1 xs:text-[20px] items-center justify-center xs:text-center gap-2 xsl:text-[15px] 2xl:text-lg">
                          {file.isColored ? "Colored" : "Black & White"}
                        </div>
                      </div>

                      <div className="xs:w-1/4 xs:text-[24px] w-1/4 flex justify-center gap-4 xsl:text-[15px] md:text-lg 2xl:text-2xl">
                        {file.qty}
                      </div>

                      <div className="w-2/4 flex items-center justify-center xs:gap-2  gap-4  ">
                        {selectedTab === "pending" ? (
                          <div className="flex items-center gap-2 ">
                            <OctagonAlert className="xs:w-[12px] xs:h-[12px] w-5 h-5 text-red-500 lg:w-[2vw] lg:h-[2vw] " />
                            <span className="">Pending</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3  ">
                            <CircleCheckBig className="xs:w-[20px]  w-5 text-green-500 xsl:w-[15px] xsl:h-[15px]  lg:w-[2vw] lg:h-[2vw]" />
                            <span className="">Completed</span>
                            <button
                              className="flex items-center xs:!px-3 xs:!py-3 xs:text-sm md:!px-2 md:!py-2 justify-center xs:gap-1 gap-2  !text-md font-bold text-white !bg-red-800   hover:!bg-red-700/30"
                              onClick={() => deleteSelectedFile(file._id)}
                            >
                              <Trash2 className="xs:w-6 xs:h-6 xsm:w-5 xsm:h-5 md:w-6 md:h-6" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTab === "pending" && pendingTabFiles.length === 0 && (
                  <div className="xs:mt-4 xs:text-[20px] xxs:mt-8 text-gray-300 flex items-center justify-center xsl:text-[16px] xsl:py-8 xsm:text-[15px] 2xl:text-xl">
                    No pending files!
                  </div>
                )}
                {selectedTab === "completed" &&
                  completedTabFiles.length === 0 && (
                    <div className="xs:mt-4 xs:text-[20px] xxs:mt-8 text-gray-300 flex items-center justify-center xsl:text-[16px] xsl:py-8 xsm:text-[15px] 2xl:text-xl">
                      No files yet!
                    </div>
                  )}
              </div>
              {selectedTab === "completed" && completedTabFiles.length > 0 && (
                <button
                  className="xs:mt-4 xs:!p-3 flex xs:text-[20px] flex-col items-center xs:text-sm md:text-[16px] md:mt-6 !bg-blue-600  hover:!bg-blue-800 xsm:!p-2 xsl:text-lg xsl:!px-4 2xl:!text-xl"
                  onClick={() => clearAllFiles()}
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
