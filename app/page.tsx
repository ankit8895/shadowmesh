import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { SIGN_IN_PATH } from "@/lib/auth-routes";

export default async function Home() {
  const { isAuthenticated } = await auth();

  redirect(isAuthenticated ? "/editor" : SIGN_IN_PATH);
}
