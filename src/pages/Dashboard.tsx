import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useState, useEffect } from "react";

interface DashboardProps {
  children?: React.ReactNode;
}

const Dashboard = ({ children }: DashboardProps) => {
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <SidebarProvider defaultOpen={!isMobileView}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-3 sm:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children || <DashboardContent />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;