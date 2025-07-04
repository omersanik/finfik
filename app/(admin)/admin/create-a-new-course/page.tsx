import CreateNewCourse from "@/components/admin/CreateNewCourse";
import { auth, clerkClient } from "@clerk/nextjs/server";
import React from "react";

const page = async () => {
  const { userId } = await auth();
  if (!userId) {
    return <p>You must be logged in to view this page.</p>;
  }
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user?.publicMetadata?.role;

  if (role !== "admin") {
    return <div>You do not have permission to view this page.</div>;
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <CreateNewCourse />
    </div>
  );
};

export default page;
