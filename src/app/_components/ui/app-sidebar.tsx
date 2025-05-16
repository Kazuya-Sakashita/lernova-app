"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@utils/session";
import { useLogout } from "@hooks/useLogout";
import { Button } from "./button";
import { Badge } from "@ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@ui/sidebar";
import {
  Home,
  BookOpen,
  History,
  BarChart2,
  User,
  LogOut,
  Award,
  Heart,
  PlusCircle,
  Clock,
  Shield,
  Users,
  FileText,
  PieChart,
} from "lucide-react";

// ✅ メニューアイテムの型定義
type MenuItemType = {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  isUnderDevelopment?: boolean;
  manualNav?: boolean;
};

// ✅ メニューアイテム共通コンポーネント
const MenuItem = ({
  href,
  icon: Icon,
  label,
  isActive,
  isUnderDevelopment,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  isActive: boolean;
  isUnderDevelopment?: boolean;
  onClick?: () => void;
}) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild isActive={isActive}>
      <button
        onClick={onClick}
        className="flex items-center gap-2 w-full text-left"
      >
        <Icon className="h-4 w-4" />
        <span className="flex items-center gap-2">
          {label}
          {isUnderDevelopment && (
            <Badge
              variant="outline"
              className="text-yellow-600 border-yellow-400 bg-yellow-100 text-xs"
            >
              開発中
            </Badge>
          )}
        </span>
      </button>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

export function AppSidebar() {
  const { user, isLoading, isError } = useSession();
  const { handleLogout } = useLogout();
  const pathname = usePathname();
  const router = useRouter();

  const isLoggedIn = !!user?.email;
  const isAdmin = user?.isAdmin ?? false;

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path);

  if (
    isLoading &&
    pathname !== "/login" &&
    pathname !== "/signup" &&
    pathname !== "/"
  ) {
    return <div>ログイン状態を確認しています...</div>;
  }

  if (isError) {
    return <div>ユーザー情報の取得に失敗しました。</div>;
  }

  const handleManualNav = (href: string) => () => {
    const hasOngoingTimer = !!localStorage.getItem("learning_start_time");

    if (hasOngoingTimer) {
      const confirmed = window.confirm(
        "タイマーが実行中です。このまま移動するとタイマーが停止しますが、よろしいですか？"
      );
      if (!confirmed) return;
      localStorage.removeItem("learning_start_time"); // タイマー状態リセット
    }

    router.push(href);
  };

  const menuItems: {
    loggedIn: MenuItemType[];
    learningManagement: MenuItemType[];
    community: MenuItemType[];
    admin: MenuItemType[];
    loggedOut: MenuItemType[];
  } = {
    loggedIn: [
      { href: "/", icon: Home, label: "ホーム", manualNav: true },
      {
        href: "/learning-support",
        icon: BookOpen,
        label: "学習サポート概要",
        manualNav: true,
      },
      {
        href: `/user/learning-record`,
        icon: PlusCircle,
        label: "学習を記録",
        manualNav: true,
      },
    ],
    learningManagement: [
      {
        href: "/user/dashboard",
        icon: BarChart2,
        label: "ダッシュボード",
        manualNav: true,
      },
      {
        href: "/user/learning-record",
        icon: Clock,
        label: "学習記録",
        manualNav: true,
      },
      {
        href: "/user/learning-history",
        icon: History,
        label: "学習履歴",
        manualNav: true,
      },
    ],
    community: [
      {
        href: "/blog/success-stories",
        icon: Award,
        label: "成功事例",
        isUnderDevelopment: true,
      },
      {
        href: "/user/follow/share-record",
        icon: Heart,
        label: "学習記録共有",
        isUnderDevelopment: true,
      },
    ],
    admin: [
      { href: "/admin/dashboard", icon: Shield, label: "管理者ダッシュボード" },
      { href: "/admin/users", icon: Users, label: "ユーザー管理" },
      { href: "/admin/content", icon: FileText, label: "コンテンツ管理" },
      {
        href: "/admin/progress",
        icon: PieChart,
        label: "進捗管理（管理者用）",
      },
    ],

    // ログインしていないユーザー向けのメニュー
    loggedOut: [
      { href: "/", icon: Home, label: "ホーム", manualNav: true },
      {
        href: "/learning-support",
        icon: BookOpen,
        label: "学習サポート概要",
        // manualNav: true,
      },
      {
        href: "/blog/success-stories",
        icon: Award,
        label: "成功事例",
        isUnderDevelopment: true,
        // manualNav: true,
      },
      { href: "/login", icon: LogOut, label: "ログイン", manualNav: true },
      { href: "/signup", icon: User, label: "アカウント作成", manualNav: true },
    ],
  };

  const renderMenuItems = (items: MenuItemType[]) =>
    items.map((item, index) => (
      <MenuItem
        key={index}
        href={item.href}
        icon={item.icon}
        label={item.label}
        isActive={isActive(item.href)}
        isUnderDevelopment={item.isUnderDevelopment}
        onClick={item.manualNav ? handleManualNav(item.href) : undefined}
      />
    ));

  return (
    <Sidebar className="w-16 md:w-64 fixed h-[calc(100vh-4rem)] top-16 z-40">
      <SidebarContent>
        {isLoggedIn ? (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>メインメニュー</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderMenuItems(menuItems.loggedIn)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>学習管理</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {renderMenuItems(menuItems.learningManagement)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {isAdmin && (
              <>
                <SidebarSeparator />
                <SidebarGroup>
                  <SidebarGroupLabel>管理者メニュー</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {renderMenuItems(menuItems.admin)}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            )}
          </>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(menuItems.loggedOut)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isLoggedIn && (
          <Button
            variant="outline"
            className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        )}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
