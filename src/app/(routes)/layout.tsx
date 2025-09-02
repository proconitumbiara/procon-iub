import LogoutButton from "@/components/ui/logout-button"
import { SidebarProvider } from "@/components/ui/sidebar"
import ThemeToggle from "@/components/ui/theme-toggle"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            {/* <AppSidebar /> */}
            <main className="w-full">
                <div className="absolute right-3 bottom-3 items-center">
                    <h1 className="text-xl font-bold text-primary">PROCON</h1>
                    <span className="text-sm text-muted-foreground">Itumbiara - GO</span>
                </div>
                <div className="absolute right-2 top-2 items-center">
                    <ThemeToggle />
                    <LogoutButton />
                </div>
                {children}
            </main>
        </SidebarProvider>
    )
}