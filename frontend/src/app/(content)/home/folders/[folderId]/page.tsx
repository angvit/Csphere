import React from "react";
import FolderIdLayout from "./FolderIdLayout";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Filter, ChevronDown } from "lucide-react";

export default async function Page({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const folderId = (await params).folderId;
  console.log("folder id: ", folderId);
  console.log("params received:", params);

  const paramJson = await params;
  console.log("params json: ", paramJson);
  return (
    <FolderIdLayout>
      <div className="w-full space-y-6 gap-4 mb-4">
        <div className="flex items-center gap-3 mb-8">
          <Popover>
            <PopoverTrigger asChild>
              <button className="bg-[#202A29] hover:bg-[#435856] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                <Plus size={16} />
                New Folder
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
                  //   value={folderName}
                  //   onChange={(e) => setFolderName(e.target.value)}
                  className="border border-black focus:border-gray-300 focus:outline-none text-black px-3 py-2 rounded-md"
                />
                <div className="flex items-end w-full justify-end space-x-3 text-black">
                  <button className="rounded-lg hover:bg-amber-50 px-3 py-1.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">
                    Cancel
                  </button>
                  <button
                    // onClick={createNewFolder}
                    className="rounded-lg px-3 py-1.5 bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Create
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className="bg-white hover:bg-gray-50 border border-gray-200 text-black px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                <Plus size={16} />
                Add bookmark
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              sideOffset={20}
              // alignOffset={20}
              className="w-96 bg-gray-100"
            >
              <div className="flex flex-1 flex-col text-white space-y-4 p-1">
                <h1 className="text-white font-semibold text-lg">Search</h1>
                <input
                  id="folder-name-input"
                  placeholder="Enter folder name"
                  //   value={folderName}
                  //   onChange={(e) => setFolderName(e.target.value)}
                  className="border border-black focus:border-gray-300 focus:outline-none text-black px-3 py-2 rounded-md"
                />
                <div className="flex items-end w-full justify-end space-x-3 text-black">
                  <button className="rounded-lg hover:bg-amber-50 px-3 py-1.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">
                    Cancel
                  </button>
                  <button
                    // onClick={createNewFolder}
                    className="rounded-lg px-3 py-1.5 bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Create
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </FolderIdLayout>
  );
}
