// src/components/ui/dropdown-menu.tsx
import React from "react";

interface DropdownMenuProps {
  options: string[];
  onSelect: (value: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options, onSelect }) => {
  return (
    <div className="dropdown">
      <button className="dropdown-button">Select an option</button>
      <ul className="dropdown-list">
        {options.map((option) => (
          <li
            key={option}
            onClick={() => onSelect(option)}
            className="dropdown-item"
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
};

export { DropdownMenu };
