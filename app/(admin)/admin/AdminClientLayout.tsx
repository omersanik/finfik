"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="flex items-center jusify-center gap-4 mt-4">
      <h2 className="text-2xl">Admin Panel</h2>
      <div className="ml-4">
        <Link className="m-4" href="/admin/create-a-new-course">
          <Button>Create a new Course</Button>
        </Link>
        <Link className="m-4" href="/admin/add-sections">
          <Button>Add Sections</Button>
        </Link>
        <Link className="m-4" href="/admin/add-content-blocks">
          <Button>Add Content Blocks</Button>
        </Link>
        <Link className="m-4" href="/admin/add-content-items">
          <Button>Add Content Items</Button>
        </Link>
      </div>
    </nav>
  );
} 