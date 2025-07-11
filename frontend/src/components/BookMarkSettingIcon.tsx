import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchToken } from "@/functions/user/UserData";

interface BookMarkSettingProps {
  content_id: string;
}

// Nested Popover for folders
const FolderPopover = ({
  onAddToFolder,
}: {
  onAddToFolder: (folder: any) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    const fetchUsersFolders = async () => {
      try {
        const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/folders`;

        const token = fetchToken();
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        console.log("data being returned: ", data);

        setFolders(data.data);
      } catch (error) {
        console.log("error occured in fetchUsersFolders");
      }
    };
    fetchUsersFolders();
  }, []);

  return (
    <div className="relative">
      <div
        className="cursor-pointer hover:bg-gray-200 p-2 rounded transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <p className="text-gray-700">Add to folder</p>
      </div>

      {isOpen && (
        <div
          className="absolute left-full top-0 ml-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-2">
            <div className="text-sm font-medium text-gray-900 mb-2 px-2">
              Select Folder
            </div>
            <hr className="text-gray-400" />
            <div className="max-h-60 overflow-y-auto">
              {folders.map((folder) => (
                <div
                  key={folder.folder_id}
                  className="flex items-center justify-between px-2 py-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                  onClick={() => onAddToFolder(folder)}
                >
                  <span className="text-sm text-gray-700">
                    {folder.folder_name}
                  </span>
                  {/* <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {folder.count}
                  </span> */}
                </div>
              ))}
            </div>
            {/* <div className="border-t border-gray-200 mt-2 pt-2">
              <div
                className="px-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                onClick={() =>
                  onAddToFolder({ id: "new", name: "Create New Folder" })
                }
              >
                + Create New Folder
              </div>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

function BookMarkSettingIcon({ content_id }: BookMarkSettingProps) {
  const [mainPopoverOpen, setMainPopoverOpen] = useState(false);
  const handleAddToFolder = (folder: any) => {
    try {
    } catch (error) {
      console.log("error in adding bookmark to folder", error);
    }

    console.log(
      "Adding bookmark to folder:",
      folder.name,
      "for content:",
      content_id
    );
  };

  return (
    <div className="">
      <div className="relative">
        <button
          className="text-black md:ml-2 lg:ml-3 text-xl"
          onClick={() => setMainPopoverOpen(!mainPopoverOpen)}
        >
          ⋮
        </button>

        {mainPopoverOpen && (
          <div className="absolute top-full left-0 mt-5 w-40 bg-gray-100 border border-gray-200 rounded-lg shadow-lg z-40">
            <div className="flex flex-1 flex-col space-y-1 p-1">
              <FolderPopover onAddToFolder={handleAddToFolder} />

              {/* Other menu items */}
              <div className="cursor-pointer hover:bg-gray-200 p-2 rounded transition-colors">
                <p className="text-gray-700">Edit bookmark</p>
              </div>
              <div className="cursor-pointer hover:bg-gray-200 p-2 rounded transition-colors">
                <p className="text-gray-700">Share</p>
              </div>
              <div className="cursor-pointer hover:bg-gray-200 p-2 rounded transition-colors text-red-600">
                <p className="text-red-600">Delete</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {mainPopoverOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setMainPopoverOpen(false)}
        />
      )}
    </div>
  );
}

export default BookMarkSettingIcon;
