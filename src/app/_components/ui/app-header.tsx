"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@ui/button";
import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu, LogOut, User, Settings } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@radix-ui/react-dialog";
import { AppSidebar } from "./app-sidebar";
import { useLogout } from "@hooks/useLogout";
import { useSession } from "@utils/session";
import { usePathname } from "next/navigation";
import AppLogoLink from "../AppLogoLink";

export function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isError, isLoading } = useSession(); // SWRでセッション情報を取得
  const { handleLogout } = useLogout();

  const pathname = usePathname(); // usePathname フックを使って pathname を取得

  // menuItemsを定義
  const menuItems = [
    { label: "ホーム", link: "/" },
    { label: "学習サポート", link: "/learning-support" },
    { label: "成功事例", link: "/blog/success-stories" },
  ];

  // ログイン状態を確認している間、ヘッダーとサイドバーを非表示
  if (isLoading && pathname !== "/login") {
    return <div>ログイン状態を確認しています...</div>;
  }

  if (isError) {
    return <div>ユーザー情報の取得に失敗しました。</div>;
  }

  // ユーザー情報を活用してログイン状態を判定
  const isLoggedIn = user?.email ? true : false; // emailが存在すればログインしている
  const userId = user?.id ?? null;
  const isAdmin = user?.isAdmin ?? false;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <DialogTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">メニューを開く</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0">
              <AppSidebar
                isLoggedIn={isLoggedIn}
                userId={userId}
                isAdmin={isAdmin}
                onLogout={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                menuItems={menuItems} // menuItemsを渡す
              />
            </DialogContent>
          </Dialog>

          <div className="ml-">
            <AppLogoLink
              href="/" // リンク先
              logoText="Lernova" // ロゴのテキスト
              iconColor="text-pink-500" // アイコンの色
              textColor="text-black" // テキストの色
              textSize="text-xl" // テキストのサイズ
            />
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            ホーム
          </Link>
          <Link
            href="/learning-support"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            学習サポート
          </Link>
          <Link
            href="/blog/success-stories"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            成功事例
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar.Root>
                    <Avatar.Image src="/placeholder.svg" alt="ユーザー" />
                    <Avatar.Fallback>ユ</Avatar.Fallback>
                  </Avatar.Root>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <DropdownMenu.Label>マイアカウント</DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.Item asChild>
                  <Link
                    href={`/user/${userId}/profile`}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>プロフィール</span>
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    href={`/src/app/user/learning-record`}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>学習記録</span>
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ログアウト</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">ログイン</Link>
              </Button>
              <Button className="bg-pink-500 hover:bg-pink-600" asChild>
                <Link href="/signup">新規登録</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
