import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="admin-layout">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;

function Navbar() {
  return (
    <nav className="flex items-center jusify-center gap-4 mt-4">
      <h2 className="text-2xl">Admin Panel</h2>
      <div className="ml-4">
        <Link className="m-4" href="/admin/create-a-new-course">
          <Button>Create a new Course</Button>
        </Link>
        <Link href="/admin/add-sections">
          <Button>Add Sections</Button>
        </Link>
      </div>
    </nav>
  );
}
