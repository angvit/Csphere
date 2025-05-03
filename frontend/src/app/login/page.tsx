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
    <main className="text-black">
      <Card
        style={{
          padding: "10px",
        }}
        className="mx-auto w-[400px]  border border-black shadow-md rounded-2xl "
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold mb-4 text-black">
            Welcome Back
          </CardTitle>
          <CardDescription className=" mb-4 text-black">
            Please log in to your account
          </CardDescription>
          <hr className="border-black mb-4" />
        </CardHeader>
        <LoginForm />
      </Card>
    </main>
  );
}

export default page;
