import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function FolderButton() {
  return (
    <Link href="/home/folders">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-600 hover:text-gray-400"
      >
        Folders
      </Button>
    </Link>
  );
}

export default FolderButton;
