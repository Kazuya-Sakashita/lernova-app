import React from "react";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Textarea } from "@ui/textarea";

// フォームフィールドを汎用化したコンポーネント
// ラベル、入力値、変更関数、入力タイプを受け取る
interface FormFieldProps {
  label: string; // フィールドのラベル（例: "タイトル", "内容" など）
  id: string; // 各入力フィールドのID
  value: string; // フィールドの現在の値
  onChange: (value: string) => void; // 値が変更された際に呼ばれる関数
  type: string; // 入力のタイプ（"text", "textarea", "date", "time" など）
}

// 汎用的なフォームフィールドコンポーネント
// テキスト入力またはテキストエリアの形式で表示される
const FormField = ({ label, id, value, onChange, type }: FormFieldProps) => (
  <div className="grid grid-cols-4 items-center gap-4">
    {/* フィールドのラベル */}
    <Label htmlFor={id} className="text-right">
      {label}
    </Label>

    {/* フィールドタイプに応じてテキストエリアまたはインプットを表示 */}
    {type === "textarea" ? (
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)} // 値が変更されるとonChangeが呼ばれる
        className="col-span-3"
      />
    ) : (
      <Input
        id={id}
        type={type} // 入力タイプ（text, date, timeなど）
        value={value}
        onChange={(e) => onChange(e.target.value)} // 値が変更されるとonChangeが呼ばれる
        className="col-span-3"
      />
    )}
  </div>
);

export default FormField;
