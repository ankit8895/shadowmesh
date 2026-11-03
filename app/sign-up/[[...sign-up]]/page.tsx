"use client";

import dynamic from "next/dynamic";

const SignUp = dynamic(() => import("@clerk/nextjs").then((mod) => mod.SignUp), {
  ssr: false,
});

import { Suspense } from "react";

import { AuthLayout } from "@/components/auth/auth-layout";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <SignUp />
      </Suspense>
    </AuthLayout>
  );
}
