import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <TopBar />
      <main className="md:ml-[240px] pt-14 pb-16 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
