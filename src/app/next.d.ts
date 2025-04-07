import { NextRequest } from "next/server";

declare global {
  namespace NodeJS {
    interface Global {
      userId?: string;
    }
  }
}

// NextRequest に userId プロパティを追加
declare module "next/server" {
  interface NextRequest {
    userId?: string; // userId を追加
  }
}
