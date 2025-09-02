import LogoutButton from "@/components/ui/logout-button"
import { SidebarProvider } from "@/components/ui/sidebar"
import ThemeToggle from "@/components/ui/theme-toggle"

import { AppSidebar } from "./_components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <div className="absolute right-2 top-2 items-center">
                    <ThemeToggle />
                    <LogoutButton />
                </div>
                {children}
            </main>
        </SidebarProvider>
    )
}