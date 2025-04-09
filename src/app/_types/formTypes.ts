// フォームに関連する型をまとめたファイル

// ログインフォーム用のデータ型
export type LoginFormData = {
  email: string; // ユーザーのメールアドレス
  password: string; // ユーザーのパスワード
};

// サインアップフォーム用の型
export type SignUpFormData = {
  nickname: string; // ユーザーのニックネーム
  email: string; // ユーザーのメールアドレス
  password: string; // ユーザーのパスワード
  confirmPassword: string; // パスワード確認用
};

// 学習記録に関連する型
export type LearningRecord = {
  supabaseUserId: string; // ユーザーのSupabase ID
  categoryId: number; // 学習記録のカテゴリーID
  id: string; // 学習記録のID
  title: string; // 学習記録のタイトル
  date: Date; // 学習日付
  startTime: string; // 学習開始時間
  endTime: string; // 学習終了時間
  duration: number; // 学習時間（時間単位）
  content: string; // 学習内容
};

// ユーザーのプロフィールに関連する型
export type UserProfile = {
  nickname: string; // ユーザーのニックネーム
  first_name: string; // ユーザーの姓
  last_name: string; // ユーザーの名
  gender?: string; // 性別（任意）
  bio?: string; // 自己紹介（任意）
  phoneNumber?: string; // 電話番号（任意）
  socialLinks?: string; // SNSリンク（任意）
  pushNotifications: boolean; // プッシュ通知の有効化
  date_of_birth?: string; // 生年月日（任意）
  profile_picture?: string; // プロフィール画像URL（任意）
};

// 学習記録のカテゴリーに関連する型
export interface Category {
  id: number; // カテゴリーID
  category_name: string; // カテゴリー名
}

// 生データの型を定義（APIなどから取得する元データに対応）
export interface RawRecord {
  id: string; // 学習記録のID
  supabaseUserId: string; // ユーザーのSupabase ID
  category: {
    id: number; // カテゴリーID
    category_name: string; // カテゴリー名
  };
  title: string; // 学習記録のタイトル
  learning_date: string; // 学習日付（ISO日付文字列）
  start_time: string; // 学習開始時間（ISO日付文字列）
  end_time: string; // 学習終了時間（ISO日付文字列）
  duration: number; // 学習時間
  content: string; // 学習内容
}
