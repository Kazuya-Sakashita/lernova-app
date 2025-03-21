"use client";

import type React from "react";

import { useState } from "react";
import { SidebarProvider } from "@ui/sidebar";
import { AppSidebar } from "@ui/app-sidebar";
import { AppHeader } from "@ui/app-header";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // handleLoginを削除（使用されていないため）

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setIsAdmin(false);
  };

  // menuItemsを追加
  const menuItems = [
    { label: "ホーム", link: "/" },
    { label: "学習サポート", link: "/learning-support" },
    { label: "成功事例", link: "/blog/success-stories" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          userId={userId}
          onLogout={handleLogout}
        />
        <div className="flex flex-1">
          <div className="hidden md:block">
            <AppSidebar
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              userId={userId}
              onLogout={handleLogout}
              menuItems={menuItems} // menuItemsを渡す
            />
          </div>
          <main className="flex-1 p-2 sm:p-4 md:ml-64 pt-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
