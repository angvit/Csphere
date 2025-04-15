"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import HttpClient from "@/app/classes/fetchclass";

const formSchema = z.object({
  username: z.string().min(1).min(5).max(50),
  email: z.string(),
  confirmemail: z.string(),
  password: z.string(),
  confirmpassword: z.string(),
});

interface responseData {
  status?: number;
  data?: JSON;
  error?: string;
}

export default function SignupForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      confirmemail: "",
      password: "",
      confirmpassword: "",
    },
  });

  const watchedEmail = form.watch("email");

  useEffect(() => {
    console.log("Email changed:", watchedEmail);
  }, [watchedEmail]);

  async function onSubmit(
    values: z.infer<typeof formSchema>
  ): Promise<responseData> {
    try {
      console.log(values);
      if (values.password !== values.confirmpassword) {
        toast.error("Passwords do not match.");
        return;
      }
      if (values.email !== values.confirmemail) {
        toast.error("Emails do not match.");
        return;
      }

      //MAKE THE API REQUEST
      const client = new HttpClient({
        baseUrl: "http://127.0.0.1:8000",
        defaultOpts: {
          headers: {
            "Content-Type": "application/json",
          },
        },
      });

      const response = await client.post("/api/signup", {
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
        }),
      });

      console.log("Response:", response);

      if (response.status === 200) {
        toast.success("Signup successful!");
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" type="text" {...field} />
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
              <FormLabel>Email </FormLabel>
              <FormControl>
                <Input placeholder="Email " type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmemail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Email </FormLabel>
              <FormControl>
                <Input placeholder="confirm email " type="email" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Enter your password" {...field} />
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
              <FormLabel>Confirm Pasword</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Confirm Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="bg-gray-300 hover:bg-gray-400 transition-all duration-200 text-gray-900 font-semibold py-2 px-4 rounded w-full"
          type="submit"
        >
          Submit
        </Button>
      </form>

      <hr />
      <div className="text-center text-gray-400 mt-4">
        <p className="text-sm">Have an account?</p>
        <Link href="/login">
          <Button variant="link" className="text-blue-500 hover:text-blue-700">
            Login
          </Button>
        </Link>
      </div>
    </Form>
  );
}
