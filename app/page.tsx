"use client";

import { useState, useEffect } from "react";
import { LoginSignup } from "@/components/Login/LoginSignup";
import { ChatInterface } from "@/components/Chat/ChatInterface";

interface User {
  id: string;
  phoneNumber: string;
  isAuthenticated: boolean;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("app_theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    } else {
      setTheme("light");
    }

    const storedUser = localStorage.getItem("chat_user");
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        if (
          parsedUser.isAuthenticated &&
          parsedUser.id &&
          parsedUser.phoneNumber
        ) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem("chat_user");
      }
    }
    setIsLoadingUser(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("app_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleAuthenticated = (userData: User) => {
    setUser(userData);
    localStorage.setItem("chat_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("chat_user");
  };

  if (isLoadingUser) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          theme === "dark"
            ? "bg-bg-dark text-text-secondary-dark"
            : "bg-bg-light text-text-secondary"
        }`}
      >
        <p>Loading user session...</p>
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen ${
        theme === "dark" ? "bg-bg-dark" : "bg-bg-light"
      }`}
    >
      {!user ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoginSignup onAuthenticated={handleAuthenticated} theme={theme} />
        </div>
      ) : (
        <ChatInterface
          user={user}
          onLogout={handleLogout}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </main>
  );
}
