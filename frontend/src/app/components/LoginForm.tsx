"use client";
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
import Link from "next/link";
import { PasswordInput } from "@/components/ui/password-input";
import HttpClient from "@/app/classes/fetchclass";

const formSchema = z.object({
  username: z.string().min(1).min(5).max(50),
  password: z.string(),
});

interface responseData {
  status?: number;
  data?: JSON;
  error?: string;
}

export default function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(
    values: z.infer<typeof formSchema>
  ): Promise<responseData> {
    try {
      console.log(values);

      const client = new HttpClient({
        baseUrl: "http://127.0.0.1:8000",
        defaultOpts: {
          headers: {
            "Content-Type": "application/json",
          },
        },
      });

      const response = await client.post("/api/login", {
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      if (!response.ok) {
        toast.error("Login failed. Please check your credentials.");
        return;
      }
      const data = response.json();
      console.log("Login successful", data);

      toast.success("Login successful!");
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
                <Input placeholder="username or email" type="text" {...field} />
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
                <PasswordInput placeholder="password" {...field} />
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
        <p className="text-sm">Don't have an account?</p>
        <Link href="/signup">
          <Button variant="link" className="text-blue-500 hover:text-blue-700">
            Sign Up
          </Button>
        </Link>
      </div>
    </Form>
  );
}
