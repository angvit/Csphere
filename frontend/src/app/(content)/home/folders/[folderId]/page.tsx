"use client";
import React, { useEffect, useState, use } from "react";
import FolderIdLayout from "./FolderIdLayout";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Filter, ChevronDown } from "lucide-react";
import { fetchToken } from "@/functions/user/UserData";
import BookmarkList from "@/components/BookmarkList";
import { Breadcrumb } from "../foldercomponents/Breadcrumb";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PathProps {
  id: string;
  name: string;
}
export default function Page({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  // const [folderId, setFolderId] = useState<string | null>(null);
  const { folderId } = use(params);
  const [bookmarks, setBookmarks] = useState([]);
  const [paths, setPaths] = useState<PathProps[]>([]);

  useEffect(() => {
    const fetchBookmarks = async (id: string) => {
      const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/folder/${id}`;
      const token = fetchToken();

      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data) {
          setBookmarks(data);
        }
      } catch (err) {
        console.error("Failed to fetch bookmarks", err);
      }
    };

    if (folderId) {
      fetchBookmarks(folderId);
    }
  }, [folderId]);

  useEffect(() => {
    const fetchPathStructure = async (id: string) => {
      try {
        const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/folder-path/${id}`;
        const token = fetchToken();
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        const path_data: PathProps[] = data.path;
        console.log("path_data:", path_data);
        setPaths(path_data);
      } catch (error) {
        console.log("error occured in fetchPathStructure", error);
      }
    };
    if (folderId) {
      fetchPathStructure(folderId);
    }
  }, []);
  return (
    <FolderIdLayout>
      <div className="w-full space-y-6 gap-4 mb-4">
        <div className="flex items-center justify-between gap-3 mb-8">
          <Breadcrumb paths={paths} />

          <div className="flex items-center space-x-2 w-auto">
            <Label htmlFor="bucketing-mode" className="text-black">
              Bucketing Mode
            </Label>
            <Switch
              id="bucketing-mode"
              className="
          data-[state=unchecked]:bg-gray-400
          data-[state=checked]:bg-black
          [&>span]:bg-white
          [&>span]:h-5
          [&>span]:w-5
          [&>span]:transition-transform
          [&>span]:duration-200
          [&>span]:translate-x-0
          data-[state=checked]:[&>span]:translate-x-5
        "
            />
          </div>
        </div>

        <BookmarkList items={bookmarks} />
      </div>
    </FolderIdLayout>
  );
}
