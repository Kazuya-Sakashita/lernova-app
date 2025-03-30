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

// 学習記録に関連する型
export type LearningRecord = {
  supabaseUserId: string;
  categoryId: string;
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: string;
  content: string;
};
