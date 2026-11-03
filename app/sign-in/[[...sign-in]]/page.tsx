"use client";

import dynamic from "next/dynamic";

const SignIn = dynamic(() => import("@clerk/nextjs").then((mod) => mod.SignIn), {
  ssr: false,
});

import { Suspense } from "react";

import { AuthLayout } from "@/components/auth/auth-layout";

export default function SignInPage() {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <SignIn />
      </Suspense>
    </AuthLayout>
  );
}
