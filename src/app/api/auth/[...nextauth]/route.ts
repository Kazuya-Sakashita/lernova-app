import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET, // 環境変数からsecretを取得
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "", // GitHubのクライアントIDを取得
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "", // GitHubのクライアントシークレットを取得
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "", // GoogleのクライアントIDを取得（修正）
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "", // Googleのクライアントシークレットを取得（修正）
    }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
