"use client";

import Sidebar from "./sidebar/page";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-white">{children}</div>
    </div>
  );
}
