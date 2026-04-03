import { useUser, useClerk } from "@clerk/react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, Plus, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [location] = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">P</div>
              <span>ProposAI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/dashboard"}>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.startsWith("/proposals") && location !== "/proposals/new"}>
                  <Link href="/proposals" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Proposals</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/proposals/new"}>
                  <Link href="/proposals/new" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>New Proposal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate">{user?.fullName || "User"}</span>
                <span className="text-xs text-sidebar-foreground/70 truncate">{user?.primaryEmailAddress?.emailAddress}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => signOut()} className="text-sm flex items-center gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors w-full p-2 rounded hover:bg-sidebar-accent">
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center px-4 border-b border-border md:hidden bg-background sticky top-0 z-10">
            <SidebarTrigger />
            <div className="ml-4 font-semibold">ProposAI</div>
          </header>
          <div className="flex-1 overflow-auto p-6 md:p-8 max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
