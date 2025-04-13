import React from "react";
import SignupForm from "@/app/components/SignupForm";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function page() {
  return (
    <main>
      <Card
        style={{
          padding: "20px",
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
        <SignupForm />
      </Card>
    </main>
  );
}
