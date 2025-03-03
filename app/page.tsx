"use client";

import { useEffect} from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="));

      if (authToken) {
        localStorage.setItem("isAuthenticated", "true"); // Store auth state
        router.push("/dashboard");
      } else {
        const storedAuth = localStorage.getItem("isAuthenticated");
        if (storedAuth === "true") {
          router.push("/dashboard"); // If stored, navigate to dashboard
        } else {
          localStorage.removeItem("isAuthenticated"); // Clear if expired
          router.push("/login");
        }
      }
    };

    checkAuth();
  }, [router]);

  return null; // Prevents flickering during redirect
}
