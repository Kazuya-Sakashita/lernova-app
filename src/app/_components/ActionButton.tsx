import React from "react";
import { Button } from "@ui/button";

// 汎用的なアクションボタン
interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  label,
}) => (
  <Button variant="outline" size="sm" onClick={onClick}>
    {icon}
    <span className="sr-only md:not-sr-only md:ml-2">{label}</span>
  </Button>
);

export default ActionButton;
