"use client";

import React from "react";
import type { Category } from "../_types/formTypes";

interface Props {
  categories: Category[];
}

export function CategoryTree({ categories }: Props) {
  console.log("Rendering CategoryTree with categories:", categories);
  return (
    <ul className="list-disc pl-4">
      {categories.map((cat) => (
        <li key={cat.id} className="mb-1">
          <span>{cat.category_name}</span>

          {(cat.children?.length ?? 0) > 0 && (
            <div className="ml-4 mt-1">
              <CategoryTree categories={cat.children ?? []} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
