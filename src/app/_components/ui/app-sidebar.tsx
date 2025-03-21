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
  HelpCircle,
  LogOut,
  Users,
  FileText,
  PieChart,
  Shield,
  Clock,
  Award,
  Bookmark,
  Heart,
  PlusCircle,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ui/collapsible";

export function AppSidebar() {
  const { user, isLoading, isError } = useSession(); // SWRでユーザー情報を取得
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path);
  };

  // ログインしているかどうかの判定
  const isLoggedIn = user?.email ? true : false; // ユーザー情報がある場合はログインしていると判定
  const userId = user?.id ?? null;
  const isAdmin = user?.isAdmin ?? false;

  // ローディング状態を非表示にし、エラーハンドリングも削除
  if (isError) {
    return <div>ユーザー情報の取得に失敗しました。</div>;
  }

  return (
    <Sidebar className="w-16 md:w-64 fixed h-[calc(100vh-4rem)] top-16 z-40">
      <SidebarContent>
        {/* ログインしている場合 */}
        {isLoggedIn ? (
          <>
            {/* メインメニュー */}
            <SidebarGroup>
              <SidebarGroupLabel>メインメニュー</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/")}>
                      <Link href="/">
                        <Home className="h-4 w-4" />
                        <span>ホーム</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/learning-support")}
                    >
                      <Link href="/learning-support">
                        <BookOpen className="h-4 w-4" />
                        <span>学習サポート概要</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(
                        `/user/${userId}/learning-record/time-input`
                      )}
                    >
                      <Link href={`/user/${userId}/learning-record/time-input`}>
                        <PlusCircle className="h-4 w-4" />
                        <span>学習を記録</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* 学習管理 */}
            <SidebarGroup>
              <SidebarGroupLabel>学習管理</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <Collapsible className="w-full">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={isActive(`/src/app/user/learning-record`)}
                        >
                          <Clock className="h-4 w-4" />
                          <span>学習記録</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive(
                                `/src/app/user/learning-record`
                              )}
                            >
                              <Link href={`/src/app/user/learning-record`}>
                                記録一覧
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive(
                                `/src/app/user/learning-record/time-input`
                              )}
                            >
                              <Link
                                href={`/src/app/user/learning-record/time-input`}
                              >
                                時間入力
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(`/user/${userId}/learning-history`)}
                    >
                      <Link href={`/user/${userId}/learning-history`}>
                        <History className="h-4 w-4" />
                        <span>学習履歴</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(`/user/${userId}/progress`)}
                    >
                      <Link href={`/user/${userId}/progress`}>
                        <BarChart2 className="h-4 w-4" />
                        <span>進捗管理</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* コミュニティ */}
            <SidebarGroup>
              <SidebarGroupLabel>コミュニティ</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(`/blog/success-stories`)}
                    >
                      <Link href="/blog/success-stories">
                        <Award className="h-4 w-4" />
                        <span>成功事例</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(`/user/${userId}/follow/share-record`)}
                    >
                      <Link href={`/user/${userId}/follow/share-record`}>
                        <Heart className="h-4 w-4" />
                        <span>学習記録共有</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/dashboard")}
                        >
                          <Link href="/admin/dashboard">
                            <Shield className="h-4 w-4" />
                            <span>管理者ダッシュボード</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/users")}
                        >
                          <Link href="/admin/users">
                            <Users className="h-4 w-4" />
                            <span>ユーザー管理</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/content")}
                        >
                          <Link href="/admin/content">
                            <FileText className="h-4 w-4" />
                            <span>コンテンツ管理</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/progress")}
                        >
                          <Link href="/admin/progress">
                            <PieChart className="h-4 w-4" />
                            <span>進捗管理（管理者用）</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            )}
          </>
        ) : (
          /* ログインしていない場合のメニュー */
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/")}>
                    <Link href="/">
                      <Home className="h-4 w-4" />
                      <span>ホーム</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/learning-support")}
                  >
                    <Link href="/learning-support">
                      <BookOpen className="h-4 w-4" />
                      <span>学習サポート概要</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/blog/success-stories")}
                  >
                    <Link href="/blog/success-stories">
                      <Award className="h-4 w-4" />
                      <span>成功事例</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/login")}>
                    <Link href="/login">
                      <LogOut className="h-4 w-4" />
                      <span>ログイン</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/signup")}>
                    <Link href="/signup">
                      <User className="h-4 w-4" />
                      <span>アカウント作成</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* サポートメニュー */}
        <SidebarGroup>
          <SidebarGroupLabel>サポート</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/support")}>
                  <Link href="/support">
                    <HelpCircle className="h-4 w-4" />
                    <span>サポート</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/privacy-policy")}
                >
                  <Link href="/privacy-policy">
                    <Bookmark className="h-4 w-4" />
                    <span>プライバシーポリシー</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
