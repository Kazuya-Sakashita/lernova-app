// フォームに関連する型をまとめたファイル

// ログインフォーム用のデータ型
export type LoginFormData = {
  email: string;
  password: string;
};

// サインアップフォーム用の型
export type SignUpFormData = {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
};
