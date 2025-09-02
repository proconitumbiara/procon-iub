"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth.client";

import AddArchivingForm from "../archiving/_components/add-archiving-form";


export function AppSidebar() {
  const session = authClient.useSession();

  const userInitials = session.data?.user?.name
    ?.split(" ")
    .map((name) => name[0])
    .join("");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="bg-background flex items-center justify-center border-b p-4" />

      <SidebarContent className="bg-background flex items-center justify-center">
        {/* Formulário dentro da sidebar */}
        <SidebarGroup className="group-data-[state=collapsed]:hidden">
          <SidebarGroupContent>
            <AddArchivingForm />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-background border-t py-4">
        <SidebarMenu>
          <SidebarMenuItem>

            <SidebarMenuButton size="lg">
              <Avatar className="h-12 w-12 rounded-full border-2 border-green-500 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8">
                <AvatarImage src={session.data?.user?.image || ""} />
                {!session.data?.user?.image && (
                  <AvatarFallback>{userInitials}</AvatarFallback>
                )}
              </Avatar>
              <div className="group-data-[state=collapsed]:hidden">
                <p className="text-sm">{session.data?.user?.name}</p>
                <p className="text-muted-foreground text-xs">
                  {session.data?.user.email}
                </p>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
