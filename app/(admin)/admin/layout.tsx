import { auth, clerkClient } from "@clerk/nextjs/server";
import AdminClientLayout from "./AdminClientLayout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) return <div>You must be logged in to view this page!</div>;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user?.publicMetadata?.role;
  if (role !== "admin") return <div>You must be an Admin to visit the Admin Page</div>;

  return <AdminClientLayout>{children}</AdminClientLayout>;
}
