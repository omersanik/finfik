// app/admin/page.tsx
import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function AdminPage() {
  const { userId } = await auth(); // ✅ Need to await auth()

  if (!userId) {
    return <div>You must be logged in to view this page.</div>;
  }

  const client = await clerkClient(); // ✅ Need to await clerkClient()
  const user = await client.users.getUser(userId);
  const role = user?.publicMetadata?.role;

  if (role !== "admin") {
    return <div>You do not have permission to view this page.</div>;
  }

  return <div>✅ Welcome Admin</div>;
}
