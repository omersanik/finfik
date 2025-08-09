import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Book, Layers, Blocks, FileText, Trash2 } from "lucide-react";

async function getStats() {
  // Fetch real data from APIs
  const [coursesRes, itemsRes] = await Promise.all([
    fetch(process.env.NEXT_PUBLIC_SITE_URL + "/api/courses", { cache: "no-store" }),
    fetch(process.env.NEXT_PUBLIC_SITE_URL + "/api/admin/content-items", { cache: "no-store" }),
  ]);
  const courses = await coursesRes.json();
  const items = await itemsRes.json();
  // For sections and blocks, sum up from courses/items if needed
  // (You can add more API endpoints for exact counts if needed)
  let sections = 0;
  let blocks = 0;
  try {
    const sectionsRes = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/api/admin/sections?course_path_id=all", { cache: "no-store" });
    const allSections = await sectionsRes.json();
    sections = Array.isArray(allSections) ? allSections.length : 0;
  } catch {}
  try {
    // If you have a blocks API, use it; otherwise, estimate from items
    blocks = Array.isArray(items) ? items.filter((i: any) => i.type === "block").length : 0;
  } catch {}
  return {
    courses: Array.isArray(courses) ? courses.length : 0,
    sections,
    blocks,
    items: Array.isArray(items) ? items.length : 0,
  };
}

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) return <div>You must be logged in to view this page.</div>;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user?.publicMetadata?.role;
  if (role !== "admin") return <div>You do not have permission to view this page.</div>;

  const stats = await getStats();

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Book className="w-8 h-8 text-blue-600" />} label="Courses" value={stats.courses} />
        <StatCard icon={<Layers className="w-8 h-8 text-green-600" />} label="Sections" value={stats.sections} />
        <StatCard icon={<Blocks className="w-8 h-8 text-purple-600" />} label="Blocks" value={stats.blocks} />
        <StatCard icon={<FileText className="w-8 h-8 text-orange-600" />} label="Items" value={stats.items} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <NavCard href="/admin/create-a-new-course" title="Create a New Course" desc="Add a new course to your platform." icon={<Book className="w-6 h-6" />} />
        <NavCard href="/admin/add-sections" title="Add Sections" desc="Organize your courses into sections." icon={<Layers className="w-6 h-6" />} />
        <NavCard href="/admin/add-content-blocks" title="Add Content Blocks" desc="Add blocks to sections for modular content." icon={<Blocks className="w-6 h-6" />} />
        <NavCard href="/admin/add-content-items" title="Add Content Items" desc="Add and edit rich content, images, tables, and more." icon={<FileText className="w-6 h-6" />} />
        <NavCard href="/admin/delete-content" title="Delete Content" desc="Safely delete courses, sections, blocks, and content items." icon={<Trash2 className="w-6 h-6" />} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  );
}

function NavCard({ href, title, desc, icon }: { href: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="block bg-background rounded-xl shadow hover:shadow-lg transition p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-lg font-semibold">{title}</span>
      </div>
      <div className="text-gray-500 text-sm">{desc}</div>
    </Link>
  );
}
