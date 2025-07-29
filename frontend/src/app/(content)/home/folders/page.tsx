"use client";
import React, { useState, useEffect } from "react";
import FolderLayout from "./FolderLayout";
import { Plus, Filter, ChevronDown } from "lucide-react";
import FolderCard from "./foldercomponents/FolderCard";
import { createFolder } from "./functions/foldercreate";
import { Toaster } from "@/components/ui/sonner";
import { fetchHomeFolders } from "./functions/folderfetch";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BookmarkLayout from "../BookmarkLayout";

interface FolderDetail {
  folderId: string;
  createdAt: String;
  folderName: string;
  parentId: string;
  fileCount: number;
}

function page() {
  const [sortBy, setSortBy] = useState("Latest");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [folderCreat, setFolderCreat] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folders, setFolders] = useState<FolderDetail[]>([]);

  // handle navigation via breadcrumb
  const router = useRouter();
  // const handleNavigateToFolder = (folderId: string) => {
  //   router.push(`/folders/${folderId}`); // or whatever your dynamic route is
  // };

  interface FolderCreateProps {
    foldername: string;
    folderId: string | null;
  }

  const sortOptions = [
    "Latest",
    "Oldest",
    "Name A-Z",
    "Name Z-A",
    "Most Popular",
  ];

  useEffect(() => {
    const fetchFolders = async () => {
      const folderData = await fetchHomeFolders();
      console.log("folder details being returned: ", folderData);
      setFolders(folderData);
    };

    fetchFolders();
  }, []);

  const createNewFolder = async () => {
    console.log("folder name: ", folderName);
    if (!folderName?.trim()) {
      return;
    }

    const folderData: FolderCreateProps = {
      foldername: folderName.trim(),
      folderId: null, // Set this dynamically if you want nested folders
    };

    try {
      const folder_details = await createFolder(folderData);
      console.log("folder details being returned:", folder_details);

      if (folder_details) {
        const newFolder: FolderDetail = {
          folderId: folder_details.folder_id,
          createdAt: folder_details.created_at,
          folderName: folder_details.folder_name,
          parentId: folder_details.parent_id,
          fileCount: folder_details.file_count,
        };
        setFolders((prev) => [newFolder, ...prev]);
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      // Optionally show an error toast or message
    }
  };

  return (
    <FolderLayout>
      <div className="w-full space-y-6 gap-4 mb-4">
        <div className="flex items-center gap-3 mb-8">
          {/* New Button */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="bg-[#202A29] hover:bg-[#435856] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                <Plus size={16} />
                New
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              sideOffset={20}
              // alignOffset={20}
              className="w-96 bg-gray-100"
            >
              <div className="flex flex-1 flex-col text-white space-y-4 p-1">
                <h1 className="text-white font-semibold text-lg">New Folder</h1>
                <input
                  id="folder-name-input"
                  placeholder="Enter folder name"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="border border-black focus:border-gray-300 focus:outline-none text-black px-3 py-2 rounded-md"
                />
                <div className="flex items-end w-full justify-end space-x-3 text-black">
                  <button className="rounded-lg hover:bg-amber-50 px-3 py-1.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">
                    Cancel
                  </button>
                  <button
                    onClick={createNewFolder}
                    className="rounded-lg px-3 py-1.5 bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Create
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Filters Button */}
          <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
            <Filter size={16} />
            Filters
          </button>

          {/* Sort By Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 6h18M7 12h10M11 18h2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Sort By: {sortBy}
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                      sortBy === option
                        ? "bg-blue-50 text-gray-600"
                        : "text-gray-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2>Folders</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders?.map((folder, index) => (
          <FolderCard
            key={index}
            title={folder.folderName}
            fileCount={folder.fileCount}
            folderId={folder.folderId}
          />
        ))}
      </div>
    </FolderLayout>
  );
}

export default page;
