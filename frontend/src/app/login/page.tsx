"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import LoginForm from "@/app/components/LoginForm";

function page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen w-auto bg-gray-900 bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
      <Card
        style={{
          padding: "10px",
        }}
        className="mx-auto w-[400px] bg-gray-800 border border-gray-700 shadow-md rounded-2xl p-6"
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold mb-4">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-300 mb-4">
            Please log in to your account
          </CardDescription>
          <hr className="border-gray-700 mb-4" />
        </CardHeader>
        <LoginForm />
      </Card>
    </div>
  );
}

export default page;
