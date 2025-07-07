"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

import LoginButton from "../LoginButton";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getUserInfo, DecodeToken } from "@/functions/user/UserProfile";

type userInfo = {
  username: string;
  email: string;
  profilePath: string;
};

function ProfileDropdown() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [profileImagePath, setProfileImagePath] = useState<string>("");

  const switchDropDown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const functionality = async () => {
      const tokenData = DecodeToken();
      console.log("token data: ", tokenData);
      if (tokenData == null) {
        const userInfo: userInfo | undefined = await getUserInfo();
        console.log("user info: ", userInfo);
        setProfileImage(userInfo.profilePath);
      } else {
        setProfileImage(tokenData.profilePath);
      }
    };

    functionality();
  }, []);

  useEffect(() => {
    const fetchPresignedUrl = async (profileImagePath: string) => {
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/user/media/profile?profile_url=${encodeURIComponent(profileImagePath)}`;
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      try {
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "GET",
        });

        const data = await response.json();
        console.log("data fetched successfullyL ", data);

        if (data.success && data.presigned_url) {
          setProfileImage(data.presigned_url);
        }
      } catch (err) {
        console.error("Error fetching pre-signed URL:", err);
      }
    };

    console.log("current profile image: ", profileImage);
    if (profileImagePath !== "") {
      console.log("current profile image: ", profileImage);
      fetchPresignedUrl(profileImagePath);
    }
  }, [profileImagePath]);

  const onLogout = () => {
    document.cookie = `token=; path=/; max-age=0`;
    localStorage.removeItem("csphere_token");
    window.location.href = "/login";
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar
          className="w-16 h-16 cursor-pointer hidden md:block"
          onClick={switchDropDown}
        >
          <AvatarImage
            src={profileImage || "/placeholder.svg"}
            alt="Picture of the author"
            className="rounded-full"
          />
          <AvatarFallback className="bg-gray-200 text-gray-600">
            {/* <User className="w-6 h-6" /> */}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 z-50 backdrop-blur-md border shadow-lg"
        align="end"
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-100" />

        <DropdownMenuGroup>
          <Link href="/profile">
            <DropdownMenuItem className="cursor-pointer ">
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          {/* <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem> */}
          <Link href="/setting">
            <DropdownMenuItem className="cursor-pointer ">
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator className="bg-gray-100" />

          <DropdownMenuItem
            onClick={() => onLogout()}
            className="cursor-pointer "
          >
            Logout
          </DropdownMenuItem>

          {/* <button
            className="bg-[#E0E5E4] text-[#202A29] px-6 py-3 rounded-lg hover:bg-[#CCD3D2] text-base font-large hidden md:block"
            onClick={() => onLogout()}
          >
            Logout
          </button> */}
          {/* <DropdownMenuItem>
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem> */}
        </DropdownMenuGroup>

        {/* <DropdownMenuSeparator className="bg-white" /> */}

        {/* <DropdownMenuGroup>
          <DropdownMenuItem>
            <LoginButton />
          </DropdownMenuItem>
        </DropdownMenuGroup> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileDropdown;
