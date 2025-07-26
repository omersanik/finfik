"use client";
import dynamic from "next/dynamic";
const AddContentItemsClientPage = dynamic(
  () => import("@/components/admin/AddContentItemsClientPage"),
  { ssr: false }
);

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <AddContentItemsClientPage />
    </div>
  );
}
