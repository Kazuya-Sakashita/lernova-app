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
  confirmPassword: string; // パスワード確認用（パスワードの再入力）
};

// Supabaseセッションとユーザー情報を表すアプリ用の型
export type SessionUser = {
  id: string;
  email: string;
  supabaseUserId: string;
  nickname: string;
  isAdmin: boolean;
  role_name: string;
  token?: string | null;
};

// 学習記録に関連する型
export type LearningRecord = {
  supabaseUserId: string; // ユーザーのSupabase ID（学習記録が関連付けられているユーザーのID）
  categoryId: number; // 学習記録のカテゴリーID
  id: string; // 学習記録のID
  title: string; // 学習記録のタイトル
  date: Date; // 学習日付（Date型、学習が行われた日）
  startTime: string; // 学習開始時間（HH:mm形式、学習が開始した時間）
  endTime: string; // 学習終了時間（HH:mm形式、学習が終了した時間）
  duration: number; // 学習時間（時間単位、学習に費やした時間）
  content: string; // 学習内容（学習した内容）
};

// ユーザーのプロフィールに関連する型
export type UserProfile = {
  nickname: string; // ユーザーのニックネーム
  first_name: string; // ユーザーの姓
  last_name: string; // ユーザーの名
  gender?: string; // 性別（任意、'男', '女', 'その他'など）
  bio?: string; // 自己紹介（任意、ユーザーが自己紹介を追加できる）
  phoneNumber?: string; // 電話番号（任意、ユーザーの電話番号）
  socialLinks?: string; // SNSリンク（任意、ユーザーのSNSアカウント）
  pushNotifications: boolean; // プッシュ通知の有効化（trueまたはfalse）
  date_of_birth?: string; // 生年月日（任意、ユーザーの生年月日）
  profile_picture?: string; // プロフィール画像URL（任意、ユーザーのプロフィール画像）
};

// 学習記録のカテゴリーに関連する型
export interface Category {
  id: number; // カテゴリーID（カテゴリーの一意な識別子）
  category_name: string; // カテゴリー名（例: "プログラミング", "数学" など）
  parent_id?: number | null; // カテゴリID（ルートなら null）
  children?: Category[]; // カテゴリ詳細（再帰的構造）
}

// 生データの型を定義（APIなどから取得する元データに対応）
export interface RawRecord {
  id: string; // 学習記録のID
  supabaseUserId: string; // ユーザーのSupabase ID（学習記録が関連付けられているユーザーのID）
  category: {
    id: number; // カテゴリーID（学習記録のカテゴリーID）
    category_name: string; // カテゴリー名（学習記録のカテゴリー名）
  };
  title: string; // 学習記録のタイトル
  learning_date: string; // 学習日付（ISO形式の日付文字列）
  start_time: string; // 学習開始時間（ISO形式の時間文字列）
  end_time: string; // 学習終了時間（ISO形式の時間文字列）
  duration: number; // 学習時間（学習時間）
  content: string; // 学習内容（学習した内容の詳細）
}

// 学習記録ダイアログのプロパティ型
export interface LearningRecordDialogProps {
  onAddRecord: (record: LearningRecord) => void; // 新しい学習記録を追加するための関数
  onSaveRecord: (record: LearningRecord) => void; // 既存の学習記録を保存するための関数
  onDeleteRecord: (id: string) => void; // 学習記録を削除するための関数
  recordToEdit: LearningRecord | null; // 編集する学習記録（nullの場合は新規作成）
  isEditing: boolean; // 編集モードかどうかを示すフラグ
  refreshRecords: () => void; // 学習記録更新後に再フェッチするための関数
  open: boolean; // ダイアログの開閉状態を示すフラグ
  setOpen: (open: boolean) => void; // ダイアログの開閉を制御する関数
}

// フォームフィールドの型
export interface FormFieldProps {
  label: string; // フィールドのラベル（例: "タイトル", "内容" など）
  id: string; // 各入力フィールドのID
  value: string; // フィールドの現在の値
  onChange: (value: string) => void; // 値が変更された際に呼ばれる関数
  type: string; // 入力のタイプ（"text", "textarea", "date", "time" など）
}

export interface RawLearningRecord {
  id: string;
  title: string;
  category_id: number;
  start_time: string;
  end_time: string;
  content: string;
}
