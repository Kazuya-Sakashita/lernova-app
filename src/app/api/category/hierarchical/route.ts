// /app/api/category/hierarchical/route.ts
import { prisma } from "@utils/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: true,
    },
  });

  console.log("Hierarchical categories fetched:", categories);
  return NextResponse.json(categories);
}
