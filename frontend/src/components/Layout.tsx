import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import {
  LogOut,
  Menu,
  X,
  UploadCloud,
  List,
  PieChart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PixelLogo } from "@/components/ui/PixelLogo";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { icon: UploadCloud, label: "Import Data", path: "/import" },
    { icon: List, label: "Case List", path: "/cases" },
    { icon: PieChart, label: "Analytics", path: "#" },
    { icon: Settings, label: "Settings", path: "#" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden transition-colors duration-300">
      {/* --- AMBIENT BEAMS (Classy Gradient Backgrounds) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* 1. TOP-CENTER BEAM (The "Stage Light") */}
        <div
          className={cn(
            "absolute top-[-200px] left-1/2 -translate-x-1/2 w-[100vw] max-w-[1200px] h-[700px] rounded-[100%] blur-[120px] transition-all duration-700",
            // Light Mode: Blue/Indigo mix, Multiply mode to show on white
            "bg-blue-300/20 mix-blend-multiply",
            // Dark Mode: Brand Primary, Screen mode to glow on black
            "dark:bg-primary/15 dark:mix-blend-screen"
          )}
        />

        {/* 2. BOTTOM-LEFT BEAM (The "Foundation Glow") */}
        <div
          className={cn(
            "absolute bottom-[-200px] left-[-200px] w-[800px] h-[800px] rounded-full blur-[130px] transition-all duration-700",
            // Light Mode: Purple tint
            "bg-purple-300/20 mix-blend-multiply",
            // Dark Mode: Deep Indigo
            "dark:bg-blue-600/10 dark:mix-blend-screen"
          )}
        />

        {/* 3. TOP-RIGHT ACCENT (Subtle Balance) */}
        <div
          className={cn(
            "absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full blur-[100px] transition-all duration-700",
            // Light Mode
            "bg-primary/10 mix-blend-multiply",
            // Dark Mode
            "dark:bg-brand-light/5 dark:mix-blend-screen"
          )}
        />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8 justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div
              className="flex items-center space-x-2 group cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="bg-primary p-1.5 rounded-md shadow-sm shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                <Link to="/">
                  <PixelLogo className="h-5 w-5 text-primary-foreground" />
                </Link>
              </div>
              <span className="text-xl font-bold hidden sm:inline-block tracking-tight text-foreground">
                CaseFlow
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs font-medium text-muted-foreground hidden md:inline-block bg-muted/50 px-2 py-1 rounded-full border border-border/50">
              {user?.email}
            </span>
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden relative z-10">
        {/* SIDEBAR */}
        <aside
          className={cn(
            "border-r border-border/40 bg-background/40 backdrop-blur-sm w-64 transition-all duration-300 ease-in-out overflow-y-auto",
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0 lg:w-16",
            "fixed inset-y-0 left-0 z-30 mt-16 lg:static lg:mt-0"
          )}
        >
          <div className="flex h-full flex-col py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    !isSidebarOpen && "lg:justify-center px-2"
                  )}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  {/* Active Indicator Line (Left) */}
                  {location.pathname === item.path && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}

                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      isSidebarOpen ? "mr-3" : "lg:mr-0",
                      location.pathname === item.path
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "truncate transition-all duration-200",
                      isSidebarOpen
                        ? "opacity-100 w-auto"
                        : "lg:hidden w-0 opacity-0"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
            <div className="mt-auto px-2 lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5 mr-3" /> Close Sidebar
              </Button>
            </div>
          </div>
        </aside>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 focus:outline-none scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500 slide-in-from-bottom-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
