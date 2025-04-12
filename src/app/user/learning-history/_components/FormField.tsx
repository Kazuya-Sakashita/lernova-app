import React from "react";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Textarea } from "@ui/textarea";
import { FormFieldProps } from "@/app/_types/formTypes";

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
