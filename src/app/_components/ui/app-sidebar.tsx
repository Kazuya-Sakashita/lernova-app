"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@utils/session";
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
  HelpCircle,
  Bookmark,
} from "lucide-react"; // 必要なアイコンをインポート

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

// メニューアイテムを共通化したコンポーネント
const MenuItem = ({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  isActive: boolean;
}) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild isActive={isActive}>
      <Link href={href}>
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

export function AppSidebar() {
  const { user, isLoading, isError } = useSession();
  const pathname = usePathname();

  // アクティブなリンクの判定
  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path);

  // ログイン状態を判定
  const isLoggedIn = user?.email ? true : false;
  const userId = user?.id ?? null;
  const isAdmin = user?.isAdmin ?? false;

  // ローディング中またはエラー時の表示
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

  // ログイン時のメニューアイテム
  const loggedInMenuItems = [
    { href: "/", icon: Home, label: "ホーム" },
    { href: "/learning-support", icon: BookOpen, label: "学習サポート概要" },
    {
      href: `/user/${userId}/learning-record/time-input`,
      icon: PlusCircle,
      label: "学習を記録",
    },
  ];

  // 学習管理メニューアイテム
  const learningManagementItems = [
    { href: `/src/app/user/learning-record`, icon: Clock, label: "学習記録" },
    {
      href: `/user/${userId}/learning-history`,
      icon: History,
      label: "学習履歴",
    },
    { href: `/user/${userId}/progress`, icon: BarChart2, label: "進捗管理" },
  ];

  // コミュニティメニューアイテム
  const communityItems = [
    { href: "/blog/success-stories", icon: Award, label: "成功事例" },
    {
      href: `/user/${userId}/follow/share-record`,
      icon: Heart,
      label: "学習記録共有",
    },
  ];

  // 管理者メニューアイテム
  const adminMenuItems = [
    { href: "/admin/dashboard", icon: Shield, label: "管理者ダッシュボード" },
    { href: "/admin/users", icon: Users, label: "ユーザー管理" },
    { href: "/admin/content", icon: FileText, label: "コンテンツ管理" },
    { href: "/admin/progress", icon: PieChart, label: "進捗管理（管理者用）" },
  ];

  // ログインしていない時のメニューアイテム
  const loggedOutMenuItems = [
    { href: "/", icon: Home, label: "ホーム" },
    { href: "/learning-support", icon: BookOpen, label: "学習サポート概要" },
    { href: "/blog/success-stories", icon: Award, label: "成功事例" },
    { href: "/login", icon: LogOut, label: "ログイン" },
    { href: "/signup", icon: User, label: "アカウント作成" },
  ];

  return (
    <Sidebar className="w-16 md:w-64 fixed h-[calc(100vh-4rem)] top-16 z-40">
      <SidebarContent>
        {isLoggedIn ? (
          <>
            {/* ログイン時のメインメニュー */}
            <SidebarGroup>
              <SidebarGroupLabel>メインメニュー</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {loggedInMenuItems.map((item, index) => (
                    <MenuItem
                      key={index}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      isActive={isActive(item.href)}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* 学習管理メニュー */}
            <SidebarGroup>
              <SidebarGroupLabel>学習管理</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {learningManagementItems.map((item, index) => (
                    <MenuItem
                      key={index}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      isActive={isActive(item.href)}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* コミュニティメニュー */}
            <SidebarGroup>
              <SidebarGroupLabel>コミュニティ</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {communityItems.map((item, index) => (
                    <MenuItem
                      key={index}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      isActive={isActive(item.href)}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* 管理者メニュー */}
            {isAdmin && (
              <>
                <SidebarSeparator />
                <SidebarGroup>
                  <SidebarGroupLabel>管理者メニュー</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {adminMenuItems.map((item, index) => (
                        <MenuItem
                          key={index}
                          href={item.href}
                          icon={item.icon}
                          label={item.label}
                          isActive={isActive(item.href)}
                        />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            )}
          </>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {loggedOutMenuItems.map((item, index) => (
                  <MenuItem
                    key={index}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={isActive(item.href)}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* サポートメニュー */}
        <SidebarGroup>
          <SidebarGroupLabel>サポート</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuItem
                href="/support"
                icon={HelpCircle}
                label="サポート"
                isActive={isActive("/support")}
              />
              <MenuItem
                href="/privacy-policy"
                icon={Bookmark}
                label="プライバシーポリシー"
                isActive={isActive("/privacy-policy")}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
