export function parseLearningRecordId(id: string): {
  value: number | null;
  error?: string;
} {
  const recordId = Number(id);
  if (isNaN(recordId) || recordId <= 0) {
    return { value: null, error: "無効な学習記録IDです" };
  }
  return { value: recordId };
}
