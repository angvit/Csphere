import React from "react";
import { FolderClosed } from "lucide-react";
import Link from "next/link";

interface props {
  title: string;
  fileCount: number;
  folderId: string;
  handleFolderDelete: Function;
}

function FolderCard({ title, fileCount, folderId, handleFolderDelete }: props) {
  return (
    <Link href={`/home/folders/${folderId}`}>
      <div className="border border-black rounded-lg px-6  transition-shadow flex flex-col justify-between h-full cursor-pointer py-10">
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
        <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
          <span>{fileCount} Files</span>

          {/*Exclude the delete button from the whole cover  */}
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              handleFolderDelete(folderId);
            }}
            className="rounded-lg hover:bg-red-400 hover:transition-colors bg-red-500 px-4 py-2 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </Link>
  );
}

export default FolderCard;
