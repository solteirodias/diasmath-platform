export const QUESTION_IMAGE_BUCKET = "question-images";
export const MAX_QUESTION_IMAGE_BYTES = 5 * 1024 * 1024;
export const QUESTION_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif";

const extensions: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
};

export function validateQuestionImage(file: Pick<File, "name" | "type" | "size">): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!extensions[file.type]?.includes(extension)) return "Selecione uma imagem JPG, JPEG, PNG, WEBP ou GIF.";
  if (file.size > MAX_QUESTION_IMAGE_BYTES) return "A imagem deve ter no máximo 5 MB.";
  if (file.size === 0) return "O arquivo de imagem está vazio.";
  return null;
}

export function questionImagePath(userId: string, fileName: string, uniqueId: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!/^[a-zA-Z0-9-]+$/.test(userId) || !/^[a-zA-Z0-9-]+$/.test(uniqueId) || !Object.values(extensions).flat().includes(extension)) {
    throw new Error("Caminho de imagem inválido.");
  }
  return `${userId}/${uniqueId}.${extension}`;
}

export function validateQuestionContent(q: { kind: string; text: string; image_path?: string | null; image_url?: string | null; options: string[]; correct: number }): string | null {
  const hasImage = Boolean(q.image_path || q.image_url);
  if (q.kind === "image" && !hasImage) return "Insira uma imagem na questão.";
  if (!q.text.trim() && !hasImage) return "Preencha o enunciado ou insira uma imagem.";
  if (q.options.length < 2 || q.options.length > 5 || q.options.some((option) => !option.trim())) return "Preencha de 2 a 5 alternativas.";
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length) return "Marque uma resposta correta.";
  return null;
}