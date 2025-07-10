import React from "react";
import { FolderClosed } from "lucide-react";

interface props {
  title: string;
  fileCount: number;
  size: null | string;
}

function FolderCard({ title, fileCount, size = null }: props) {
  return (
    <div className="border border-black rounded-lg px-6 hover:shadow-md transition-shadow flex flex-col justify-between h-full cursor-pointer py-10">
      {/* Folder Icon */}
      <div className="mb-3">
        <div className="w-12 h-12 bg-[#202A29] rounded-lg flex items-center justify-center">
          <FolderClosed size={26} className="text-white" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-gray-900 font-medium text-sm mb-1 truncate">
        {title}
      </h3>

      {/* File count and size */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{fileCount} Files</span>
      </div>
    </div>
  );
}

export default FolderCard;
