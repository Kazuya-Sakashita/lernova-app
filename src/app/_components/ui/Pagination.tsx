"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPages = () => {
    const pageButtons = [];

    for (let i = 1; i <= totalPages; i++) {
      const isActive = currentPage === i;

      pageButtons.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors
            ${
              isActive
                ? "bg-pink-500 text-white border-pink-500 shadow"
                : "bg-white text-pink-700 border-pink-200 hover:bg-pink-50"
            }`}
        >
          {i}
        </button>
      );
    }

    return pageButtons;
  };

  return (
    <div className="mt-6 flex items-center justify-center space-x-2">
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg border text-sm font-medium text-pink-700 border-pink-300
        hover:bg-pink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← 前へ
      </button>

      <div className="flex items-center gap-1">{renderPages()}</div>

      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg border text-sm font-medium text-pink-700 border-pink-300
        hover:bg-pink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        次へ →
      </button>
    </div>
  );
};

export default Pagination;
