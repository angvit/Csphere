import React from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  username: z.string().min(1).min(5).max(50),
  email: z.string(),
  confirmemail: z.string(),
  password: z.string(),
  confirmpassword: z.string(),
});

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
  return (
    <Form {...form}>
      <form className="text-black w-full flex grow flex-col space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Username</FormLabel>
              <FormControl className="w-full">
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
            <FormItem className="w-full">
              {" "}
              {/* Added w-full */}
              <FormLabel>Email</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="email" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="w-full">
              {" "}
              {/* Added w-full */}
              <FormLabel>Password</FormLabel>
              <FormControl className="w-full">
                <PasswordInput placeholder="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmpassword"
          render={({ field }) => (
            <FormItem className="w-full">
              {" "}
              {/* Added w-full */}
              <FormLabel>Confirm password</FormLabel>
              <FormControl className="w-full">
                <PasswordInput placeholder="confirm password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

export default Account;
