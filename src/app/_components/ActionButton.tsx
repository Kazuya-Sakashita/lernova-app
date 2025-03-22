import React from "react";
import { Button } from "@ui/button";

// ボタンのvariantプロパティの型を明確に指定
interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: "outline" | "destructive" | "default"; // variantプロパティを明確に
  className?: string; // classNameプロパティを追加
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  label,
  variant = "outline", // デフォルトを "outline" に設定
  className = "", // デフォルトでclassNameを空文字に設定
}) => {
  // ボタンのクラス名を条件に応じて切り替え
  const buttonClass =
    variant === "destructive"
      ? "bg-red-600 text-white hover:bg-red-700 hover:scale-105 hover:shadow-xl transition-all duration-200 transform"
      : variant === "outline"
      ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-xl transition-all duration-200 transform"
      : "bg-gray-600 text-white hover:bg-gray-700 hover:scale-105 hover:shadow-xl transition-all duration-200 transform"; // ボタンがホバー時に拡大してシャドウが追加される

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      className={`${buttonClass} ${className} flex items-center gap-2 p-2 rounded-md`} // classNameを追加で受け取る
    >
      {icon}
      <span className="sr-only md:not-sr-only md:ml-2">{label}</span>
    </Button>
  );
};

export default ActionButton;
