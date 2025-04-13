"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      toastOptions={{
        classNames: {
          success: "bg-green-500 text-white border-none",
          error: "bg-red-500 text-white border-none",
          warning: "bg-yellow-400 text-black border-none",
          info: "bg-blue-500 text-white border-none",
        },
        style: {
          backgroundColor: "white",
          color: "black",
          border: "1px solid #e5e7eb",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
