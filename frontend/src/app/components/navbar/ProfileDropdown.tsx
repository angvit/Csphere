import React, { useState } from "react";
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

function ProfileDropdown() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const switchDropDown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Image
          src="/profile-placeholder.svg"
          width={50}
          height={50}
          alt="Picture of the author"
          className="bg-gray-200 rounded-full p-1 cursor-pointer"
          onClick={switchDropDown}
        />
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
