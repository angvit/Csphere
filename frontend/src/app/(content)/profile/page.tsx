"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Mail, Lock } from "lucide-react";
// import { PasswordInput } from "@/components/ui/password-input";
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
  sub: string;
  email: string;
  username: string;
  role: string;
  exp: number;
  profilePath: string;
};

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string>(
    "/placeholder.svg?height=120&width=120"
  );
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile/info`;
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("response: ", response);

        const data = await response.json();

        setUsername(data.username);
        setEmail(data.email);
        setProfileImage(data.profilePath);

        console.log("data: ", data);
      } catch (error) {}
    };

    const token_data = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (token_data === null) {
      getUserInfo();
    } else {
      const decoded: DecodedToken = jwtDecode(token_data as string);
      setEmail(decoded.email);
      setUsername(decoded.username);
      setProfileImage(decoded.profilePath);
    }
  }, []);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("pfp", file); // must match `pfp: UploadFile` in FastAPI
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return;

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/media`;

    try {
      const res = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      console.log("data from media: ", data);
      console.log("Uploaded image URL:", data.profile_media);

      // Update your UI with the returned image URL
      setProfileImage(data.profile_media);
      const new_jwt = data.token;
      //set the new jwt token
      document.cookie = `token=${new_jwt}; path=/; max-age=3600`;
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleSave = () => {
    // Handle save logic here
    console.log("Profile saved:", { username, email });
  };

  return (
    <div className="min-h-screen bg-gray-300 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Profile</CardTitle>
            <CardDescription>
              Manage your account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage
                    src={profileImage || "/placeholder.svg"}
                    alt="Profile picture"
                  />
                  <AvatarFallback className="text-2xl">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="picture-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </label>
                <input
                  id="picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Click the camera icon to upload a new profile picture
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  disabled
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  disabled
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Google account connected
                </Label>
                <h1>✔</h1>
                <h1>✗</h1>
              </div>
            </div>

            {/* Action Buttons */}
            {/* <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
