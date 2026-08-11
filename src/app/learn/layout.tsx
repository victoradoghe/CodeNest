import SidebarDrawer from "@/components/SidebarDrawer";
import Sidebar from "@/components/Sidebar";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[1400px] gap-0 px-0 lg:px-4">
      {/* Persistent sidebar on large screens */}
      <aside className="no-print sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-border lg:block">
        <Sidebar />
      </aside>

      {/* Slide-over sidebar below lg */}
      <SidebarDrawer />

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
