"use client";

import Link from "next/link";
import { useSession } from "@utils/session";
import { Button } from "./_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./_components/ui/card";
import {
  BarChart2,
  BookOpen,
  Clock,
  HelpCircle,
  Home,
  PlusCircle,
} from "lucide-react";

const FeatureBadge = () => (
  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 rounded px-2 py-0.5">
    開発中
  </span>
);

const lernovaFeatures = [
  {
    title: "学習記録",
    desc: "日々の学習内容と時間を記録し、カテゴリ別に管理できます。",
  },
  {
    title: "進捗可視化",
    desc: "ヒートマップやグラフで学習時間の推移を確認できます。",
  },
  {
    title: "月別分析",
    desc: "月ごとの学習時間やカテゴリ別の学習バランスを分析できます。",
  },
];

const mainFunctions = [
  {
    icon: <Home className="mt-1 h-5 w-5 text-pink-500" />,
    title: "ダッシュボード",
    desc: "学習時間の概要、週間学習時間、カテゴリ別学習時間、学習進捗カレンダーなどを一目で確認できます。",
  },
  {
    icon: <PlusCircle className="mt-1 h-5 w-5 text-pink-500" />,
    title: "学習記録",
    desc: "学習内容、カテゴリ、時間を記録できます。タイマー機能も使用可能です。",
  },
  {
    icon: <Clock className="mt-1 h-5 w-5 text-pink-500" />,
    title: "学習履歴",
    desc: (
      <>
        過去の学習記録を一覧で確認できます。月ごとの表示や検索、フィルタリング機能も利用可能です。
        <FeatureBadge />
      </>
    ),
  },
  {
    icon: <BarChart2 className="mt-1 h-5 w-5 text-pink-500" />,
    title: "進捗管理",
    desc: (
      <>
        学習目標の設定と進捗トラッキング、カテゴリ別の学習時間分析などが可能になる予定です。
        <FeatureBadge />
      </>
    ),
  },
];

export default function GuidePage() {
  const { user, isError } = useSession();

  if (isError) {
    return <div>ユーザー情報の取得に失敗しました。</div>;
  }

  return (
    <div className="min-h-screen p-8 space-y-6">
      {/* ユーザー情報 */}
      <div className="flex justify-between items-center">
        {user ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">{user.nickname ?? user.email}</span>{" "}
            さん、ようこそLernovaへ！
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            ログインしていません。
          </p>
        )}
      </div>

      {/* タイトル */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Lernovaの使い方</h1>
        <p className="text-muted-foreground">
          Lernovaは学習を継続的にサポートし、ユーザーが自分の進捗を可視化できるアプリです。
          このガイドでは、主要機能と基本的な使い方について紹介します。
        </p>
      </div>

      {/* Lernovaとは */}
      <Card>
        <CardHeader>
          <CardTitle>Lernovaとは</CardTitle>
          <CardDescription>
            学習継続をサポートするアプリケーション
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {lernovaFeatures.map(({ title, desc }, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* 主な機能 */}
      <Card>
        <CardHeader>
          <CardTitle>主な機能</CardTitle>
          <CardDescription>Lernovaで利用できる主な機能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mainFunctions.map(({ icon, title, desc }, idx) => (
            <div key={idx} className="flex items-start gap-4">
              {icon}
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 基本的な使い方 */}
      <Card>
        <CardHeader>
          <CardTitle>はじめに</CardTitle>
          <CardDescription>Lernovaを始めるための基本ステップ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted p-4 space-y-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-pink-500" />
              <h3 className="font-medium">基本的な使い方</h3>
            </div>
            <ol className="text-sm list-decimal pl-6 space-y-2">
              <li>
                <strong>ダッシュボードを確認する</strong>
                ：ログイン後、学習状況をひと目で把握しましょう。
              </li>
              <li>
                <strong>学習を記録する</strong>
                ：学習内容や時間をすぐに記録しましょう。
              </li>
              <li>
                <strong>学習履歴を振り返る</strong>
                ：過去の記録から自分の成長をチェックしましょう。
              </li>
              <li>
                <strong>進捗を分析する</strong>
                ：カレンダーやグラフでパターンを見つけて活かしましょう。
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* はじめての方へ案内 */}
      <div className="rounded-md bg-muted p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-pink-500" />
          <h3 className="font-medium">Lernovaをはじめてみませんか？</h3>
        </div>
        <p className="mt-2 text-sm">
          Lernovaは、学びを記録し、成長を可視化するアプリです。
          継続をサポートする豊富な機能を体験するには、ログインまたは新規登録が必要です。
          あなたの学びの旅を、今日からスタートしましょう！
        </p>
        <div className="mt-4 flex gap-2">
          <Link href="/signup">
            <Button className="bg-pink-500 hover:bg-pink-600">新規登録</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">ログイン</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
