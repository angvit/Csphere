import { ReactNode } from "react";
import LatestButton from "@/app/components/home/LatestButton";
import UnreadButton from "@/app/components/home/UnreadButton";
import FolderButton from "@/app/components/home/FolderButton";

type Props = {
  children: ReactNode;
};

function FolderIdLayout({ children }: Props) {
  return (
    <div className="container  px-4 py-8 min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6 z-10 relative">
        <h1 className="text-2xl font-bold">Documents</h1>
        <div className="flex items-center gap-2">
          <LatestButton />
          <UnreadButton />
          <FolderButton />
        </div>
      </div>
      <hr className="bg-gray-200 mb-8" />
      {children} {/* This is where BookmarkList goes */}
    </div>
  );
}

export default FolderIdLayout;
