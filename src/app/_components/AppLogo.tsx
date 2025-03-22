"use client";

import { FC } from "react";

interface AppLogoProps {
  textColor?: string;
  textSize?: string;
  logoColor?: string;
  bgColor?: string;
}

const AppLogo: FC<AppLogoProps> = ({
  textColor = "text-pink-500",
  textSize = "text-xl",
  logoColor = "text-pink-500",
  bgColor = "bg-pink-50",
}) => {
  return (
    <div className="flex justify-center mb-6 items-center">
      <div
        className={`${bgColor} h-12 w-12 rounded-full flex items-center justify-center`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-6 w-6 ${logoColor}`}
        >
          <path d="M4.5 9.5V5.5C4.5 4.4 5.4 3.5 6.5 3.5H17.5C18.6 3.5 19.5 4.4 19.5 5.5V9.5" />
          <path d="M4.5 14.5V18.5C4.5 19.6 5.4 20.5 6.5 20.5H17.5C18.6 20.5 19.5 19.6 19.5 18.5V14.5" />
          <path d="M12 7.5V16.5" />
          <path d="M8.5 12H15.5" />
        </svg>
      </div>
      <span className={`${textSize} ml-3 font-semibold ${textColor}`}>
        Lernova
      </span>
    </div>
  );
};

export default AppLogo;
