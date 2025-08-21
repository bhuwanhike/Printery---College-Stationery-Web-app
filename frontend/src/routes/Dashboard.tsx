import React, { useEffect, useRef, useState, useCallback } from "react";
import {} from "lucide-react";
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
      await fetch(`http://localhost:3000/upload`, {
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
      const res = await fetch(`http://localhost:3000/upload/delete-all-files`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

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
      const res = await fetch("http://localhost:3000/uploadableFiles-DB", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
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

    const response = await fetch("http://localhost:3000/upload", {
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
    <div className="mx-auto bg-[#0b112d] w-[70%] h-full rounded-2xl p-8 shadow-lg border border-[#1b254b] my-30 px-20 flex flex-col gap-20 ">
      <div className="file-system flex flex-col gap-6">
        <div className="uploadFile border-2 w-[50%] h-90 mt-8 mx-auto border-dashed  border-gray-600 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition relative">
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
            <div className="relative p-4 w-full h-full flex flex-wrap items-center gap-4 justify-start overflow-y-auto scroll-hidden">
              {pendingPreviewUrls.map((url, idx) => (
                <div key={idx} className="relative group">
                  <button
                    type="button"
                    aria-label="Remove image"
                    className="absolute -top-2 -right-2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full w-5 h-5 flex items-center justify-center text-base shadow-md opacity-90 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePendingImage(idx);
                    }}
                    tabIndex={0}
                  >
                    &times;
                  </button>
                  <div className="w-30 h-50 border-1 rounded-md border-gray-700 shadow ">
                    <img
                      src={url}
                      alt={`Selected preview ${idx + 1}`}
                      className="object-contain w-full h-full rounded-md"
                    />
                  </div>
                  <p className="mt-1 text-gray-300 text-center w-[100px] mx-auto truncate break-words text-xs">
                    {pendingSelection[idx]?.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <>
              <File className="w-18 h-18 text-gray-400 mb-2 pointer-events-none" />
              <p className="text-md font-semibold text-gray-300 pointer-events-none">
                Drag and drop files here
              </p>
              <p className="text-sm text-gray-500 pointer-events-none">
                .png, .jpg, .jpeg, .pdf
              </p>
              {
                <div
                  className={`text-lg text-red-500 pointer-events-none mt-3 ${
                    selectedTab === "pending" || selectedTab === "completed"
                      ? "block"
                      : "hidden"
                  }`}
                >
                  Go to{" "}
                  <span className="text-yellow-600 font-bold text-lg">
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
            className=" w-[50%] mx-auto py-2 bg-gradient-to-r from-purple-900 via-blue-600 to-blue-800  text-white font-bold rounded-md mt-4"
            onClick={confirmUploads}
          >
            Add to Print Queue
          </button>
        )}
      </div>
      <div className="py-10 px-10 w-full">
        <div className="flex justify-between w-[95%] mx-auto">
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => setSelectedTab("upload")}
              className={`px-4 py-2 rounded-lg hover:!bg-gradient-to-r from-yellow-600 to-yellow-800 transition-all duration-200 hover:!text-white ${
                selectedTab === "upload"
                  ? "!border-yellow-400  text-yellow-400 !bg-transparent"
                  : "!border-gray-400 text-gray-300 !bg-transparent"
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setSelectedTab("pending")}
              className={`px-4 py-2 rounded-lg hover:!bg-gradient-to-r from-red-500 to-red-800 transition-all duration-200 hover:!text-white  ${
                selectedTab === "pending"
                  ? "!border-red-600  text-red-600 !bg-transparent"
                  : "!border-gray-400 text-gray-300 !bg-transparent"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedTab("completed")}
              className={`px-4 py-2 rounded-lg hover:!bg-gradient-to-r from-green-600 to-green-900 transition-all hover:!text-white duration-200 ${
                selectedTab === "completed"
                  ? "!border-green-400 text-green-400 !bg-transparent"
                  : "!border-gray-400 text-gray-300 !bg-transparent"
              }`}
            >
              Completed
            </button>
          </div>
        </div>
        <hr className="my-5 border-1 border-transparent h-1 w-[100%] mx-auto bg-gradient-to-r from-red-600 to-blue-600" />

        <div className="mt-10 flex flex-col gap-8">
          {selectedTab === "upload" && (
            <div className="flex flex-col items-center gap-10">
              <div className="flex flex-col min-w-full text-gray-300 justify-center">
                <div className="flex border-b border-gray-700 w-[100%] mx-auto font-semibold px-4 py-2 justify-center">
                  <div className="w-1/3 text-center">File</div>
                  <div className="w-1/3 text-center">B-W / Colored</div>
                  <div className="w-1/3 text-center">Qty.</div>
                </div>
                <div className="flex flex-col w-[100%] mx-auto">
                  {uploadableFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center border-b border-gray-800 w-[100%] mx-auto py-2 px-4 justify-center"
                    >
                      <div className="w-1/3 flex items-center gap-4 pl-4">
                        <div className="w-8 h-8 rounded-md">
                          <img
                            src={getPreviewForFile(file)}
                            alt=""
                            className="w-full h-full object-cover"
                            onClick={() => window.open(file.imgUrl)}
                          />
                        </div>
                        <span className="w-[80%] truncate">{file.name}</span>
                      </div>

                      <div className="w-1/3">
                        <div className="flex items-center justify-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-blue-500"
                              checked={file.isBlackWhite}
                              onChange={(e) =>
                                handlePrintTypeChange(
                                  index,
                                  "isBlackWhite",
                                  e.target.checked
                                )
                              }
                            />
                            <span className="text-gray-200 text-sm">B-W</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-blue-500"
                              checked={file.isColored}
                              onChange={(e) =>
                                handlePrintTypeChange(
                                  index,
                                  "isColored",
                                  e.target.checked
                                )
                              }
                            />
                            <span className="text-gray-200 text-sm">
                              Colored
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="w-1/3 flex justify-center gap-4">
                        <div className="flex items-center border-2 border-yellow-400 rounded-md">
                          <button
                            className="px-3 py-1 text-lg font-bold text-white !bg-transparent hover:!bg-yellow-600/30 hover:!rounded-full "
                            onClick={() => handleQtyChange(index, file.qty - 1)}
                          >
                            −
                          </button>
                          <span className="px-3 py-1 border-yellow-400 text-yellow-400 text-xl">
                            {file.qty}
                          </span>
                          <button
                            className="px-3 py-1 text-lg font-bold text-white !bg-transparent hover:!bg-yellow-600/30 hover:!rounded-full"
                            onClick={() => handleQtyChange(index, file.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="flex items-center justify-center gap-2 px-3 py-1 !text-md font-bold text-white !bg-gray-600 hover:!bg-gray-700/30 "
                          onClick={() => handleCancel(index)}
                        >
                          <X className="w-5 h-5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleUpload}
                className="!px-6 !py-2 !bg-blue-500 text-white font-bold rounded-md mt-4 hover:!bg-blue-600"
                disabled={isUploading || uploadableFiles.length === 0}
              >
                {isUploading ? "Uploading..." : "Pay and Upload"}
              </button>
            </div>
          )}
          {selectedTab !== "upload" && (
            <div className="flex flex-col items-center gap-10">
              <div className="flex flex-col min-w-full text-gray-300 justify-center">
                <div className="flex border-b border-gray-700 w-[100%] mx-auto font-semibold px-4 py-2 justify-center">
                  <div className="w-1/4 text-center">File</div>
                  <div className="w-1/4 text-center">B-W / Colored</div>
                  <div className="w-1/4 text-center">Qty.</div>
                  <div className="w-1/4 text-center">Status</div>
                </div>
                <div className="flex flex-col w-[100%] mx-auto">
                  {(selectedTab === "pending"
                    ? pendingTabFiles
                    : completedTabFiles
                  ).map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center border-b border-gray-800 w-[100%] mx-auto py-2 px-4 justify-center"
                    >
                      <div className="w-1/4 flex items-center gap-4 pl-4">
                        <div className="w-8 h-8 rounded-md">
                          <img
                            src={
                              file.filename.endsWith(".pdf")
                                ? pdfIcon
                                : file.url
                            }
                            alt=""
                            className="w-full h-full object-contain"
                            onClick={() => window.open(file.url)}
                          />
                        </div>
                        <span className="w-[80%] truncate">
                          {file.filename}
                        </span>
                      </div>

                      <div className="w-1/4">
                        <div className="flex items-center justify-center gap-4">
                          {file.isColored ? "Colored" : "Black & White"}
                        </div>
                      </div>

                      <div className="w-1/4 flex justify-center">
                        {file.qty}
                      </div>
                      <div className="w-1/4 flex justify-center">
                        {selectedTab === "pending" ? (
                          <div className="flex items-center gap-2">
                            <OctagonAlert className="w-5 h-5 text-red-500" />
                            Pending
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <CircleCheckBig className="w-5 h-5 text-green-500" />
                            Completed
                            <button
                              className="flex items-center justify-center !text-white !bg-red-800 !py-2 rounded-lg hover:!bg-red-700/70"
                              onClick={() => deleteSelectedFile(file._id)}
                            >
                              <Trash2 className="h-5 w-5 " />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedTab === "completed" && completedTabFiles.length > 0 && (
                <button
                  className="!bg-blue-600 !p-2 hover:!bg-blue-800 "
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
