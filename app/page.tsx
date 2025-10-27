import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...auth]/route";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
