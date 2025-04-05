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

export type UserProfile = {
  nickname: string;
  first_name: string;
  last_name: string;
  gender?: string;
  bio?: string;
  phoneNumber?: string;
  socialLinks?: string;
  pushNotifications: boolean;
  date_of_birth?: string;
  profile_picture?: string;
};
