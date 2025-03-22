"use client";

import type React from "react";

import { SidebarProvider } from "@ui/sidebar";
import { AppSidebar } from "@ui/app-sidebar";
import { AppHeader } from "@ui/app-header";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <div className="hidden md:block">
            <AppSidebar />
          </div>
          <main className="flex-1 p-2 sm:p-4 md:ml-64 pt-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
