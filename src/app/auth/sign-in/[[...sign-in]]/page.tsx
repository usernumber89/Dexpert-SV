"use client"; // Asegúrate de que la página de sign-in sea client component si el error persiste
import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null; // Evita el mismatch de hidratación

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignIn path="/auth/sign-in" />
    </div>
  );
}