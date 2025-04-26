"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@utils/session";
import { useLogout } from "@hooks/useLogout";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge"; // ✅ バッジ追加
import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Dialog, DialogTrigger, DialogContent } from "@radix-ui/react-dialog";
import { Menu, LogOut, User, Settings } from "lucide-react";
import { AppSidebar } from "./app-sidebar";
import AppLogoLink from "../AppLogoLink";

export function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isError, isLoading } = useSession();
  const { handleLogout } = useLogout();
  const pathname = usePathname();

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

  const isLoggedIn = !!user?.email;

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
              <AppSidebar />
            </DialogContent>
          </Dialog>

          <AppLogoLink
            href="/"
            logoText="Lernova"
            iconColor="text-pink-500"
            textColor="text-black"
            textSize="text-xl"
          />
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            ホーム
          </Link>

          {/* ✅ 学習サポート（開発中バッジ） */}
          <Link
            href="/learning-support"
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
          >
            学習サポート
            <Badge
              variant="outline"
              className="text-yellow-600 border-yellow-400 bg-yellow-100 text-xs"
            >
              開発中
            </Badge>
          </Link>

          {/* ✅ 成功事例（開発中バッジ） */}
          <Link
            href="/blog/success-stories"
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
          >
            成功事例
            <Badge
              variant="outline"
              className="text-yellow-600 border-yellow-400 bg-yellow-100 text-xs"
            >
              開発中
            </Badge>
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
                    <Avatar.Fallback
                      style={{
                        background:
                          "linear-gradient(135deg, #FF66B2, #D9006E, #FF3385)",
                        color: "white",
                        fontSize: "14px",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "2.5rem",
                        width: "2.5rem",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      {user?.nickname || "ユーザー"}
                    </Avatar.Fallback>
                  </Avatar.Root>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                align="end"
                className="bg-white shadow-lg rounded-lg p-2 w-48 mt-2"
              >
                <DropdownMenu.Label className="text-sm font-medium text-gray-700">
                  マイアカウント
                </DropdownMenu.Label>
                <DropdownMenu.Separator className="my-2" />
                <DropdownMenu.Item asChild>
                  <Link
                    href={`/user/profile/register`}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                  >
                    <User className="h-4 w-4 text-gray-500" />
                    <span>プロフィール</span>
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    href={`/user/learning-record`}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span>学習記録</span>
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-2" />
                <DropdownMenu.Item
                  onClick={handleLogout}
                  className="flex items-center space-x-2 p-2 text-red-500 hover:bg-gray-100 rounded"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
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
