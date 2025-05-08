import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cookies } from "next/headers";

export default function TokenCheck() {
  const pathname = usePathname();

  useEffect(() => {
    const checkToken = async () => {};
    // you can also redirect, show a message, or trigger revalidation here
  }, [pathname]); // Re-run when path changes

  return null; // no UI, just logic
}
