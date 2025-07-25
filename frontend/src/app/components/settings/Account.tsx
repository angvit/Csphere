import React from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { GoogleLogin } from "@react-oauth/google";
import { fetchGoogleCredential } from "@/functions/user/GoogleData";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  username: z.string(),
  email: z.string(),
  password: z.string(),
  confirmpassword: z.string(),
});

interface GoogleUserData {
  username: String;
  email: String;
  google_id: string;
}

function Account() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmpassword: "",
    },
  });

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  async function onSubmit(values: z.infer<typeof formSchema>): Promise<void> {
    console.log("Submitting");
    try {
      console.log(values);
      if (
        values.password !== "" &&
        values.password !== values.confirmpassword
      ) {
        toast.error("Passwords do not match.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/update`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const responseBody = await response.json();
        console.error("HTTP Error:", responseBody);
        toast.error(responseBody.detail || "Signup failed. Please try again.");
        return;
      }

      toast.success("update sucessful!");
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to update, please try again");
    }
  }

  const connectGoogleAccount = async (credentials: any) => {
    try {
      const userGoogleData: GoogleUserData = fetchGoogleCredential(credentials);
      const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/google`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userGoogleData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Google account connected");
      } else {
        toast.error("Problem connecting Google account");
      }
    } catch (error) {
      console.log("Error in connectGoogleAccount: ", error);
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      {/* User Info Section */}
      <div className="bg-gray-300 rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Update User Info
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter username"
                        type="text"
                        className="mt-1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email"
                        type="email"
                        className="mt-1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Enter new password"
                        className="mt-1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmpassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Confirm new password"
                        className="mt-1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                className="bg-[#202A29] hover:bg-gray-600 transition-all duration-200 text-white font-semibold py-2 px-6 rounded-md min-w-[140px]"
                type="submit"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Google Account Section */}
      <div className="bg-gray-300 rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Google Account
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Connect your Google account for easier access
            </p>
          </div>
        </div>

        <div className="flex justify-start">
          <GoogleLogin
            onSuccess={(credentials) => connectGoogleAccount(credentials)}
            onError={() => toast.error("Failed to connect with Google.")}
            text="continue_with"
          />
        </div>
      </div>
    </div>
  );
}

export default Account;
