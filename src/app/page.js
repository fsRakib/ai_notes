"use client";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Loader from "@/components/Loader";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setRedirecting(true);
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-start px-8"
      style={{ backgroundImage: "url('/ai-notes-home2.png')" }}
    >
      <div className="ml-8 max-w-md p-6">
        <h1 className="text-7xl font-bold text-gray-800 mb-4 leading-tight">
          AI-Powered
          <br /> Notes for <br />
          Students
        </h1>
        <p className="text-gray-700 mb-6 text-xl">
          Create notes from PDFs, ask questions, <br />
          and collaborate with classmates.
        </p>
        <div className="flex gap-4">
          <SignUpButton mode="modal">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Sign up
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="px-6 py-2 border border-gray-700 text-gray-700 rounded-lg font-semibold hover:bg-gray-100">
              Sign in
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
