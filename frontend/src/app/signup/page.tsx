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
    <main className="text-black">
      <Card
        style={{
          padding: "20px",
        }}
        className="mx-auto w-[400px] border-black  shadow-md rounded-2xl p-6"
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold mb-4 text-black">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-black mb-4">
            Please log in to your account
          </CardDescription>
          <hr className="border-black mb-4" />
        </CardHeader>
        <SignupForm />
      </Card>
    </main>
  );
}
