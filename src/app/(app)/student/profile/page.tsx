import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StudentProfilePage from "@/features/student/components/StudentProfilePage";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  return <StudentProfilePage />;
}