export const LETTERS = ["A", "B", "C", "D", "E"] as const;
export const TF_OPTIONS = ["Verdadeiro", "Falso"];

export const QUESTION_TIMES = [30, 60, 120, 180, 240, 300, 360] as const;
export const DEFAULT_QUESTION_TIME = 30;

export function normalizeQuestionTime(seconds: number): number {
  return QUESTION_TIMES.reduce<number>((nearest, candidate) =>
    Math.abs(candidate - seconds) < Math.abs(nearest - seconds) ? candidate : nearest,
    DEFAULT_QUESTION_TIME,
  );
}

export function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Mirrors the scoring in the submit_answer database function. */
export function calcPoints(correct: boolean, scoring: boolean, elapsed: number, limit: number) {
  if (!correct || !scoring) return 0;
  const e = Math.min(Math.max(elapsed, 0), limit);
  return 1000 + Math.max(0, Math.round(300 * (1 - e / limit)));
}

export type QuestionKind = "multiple" | "truefalse" | "image";

export type GameQuestion = {
  status: "lobby" | "question" | "reveal" | "finished";
  index: number;
  total: number;
  title?: string;
  scoring?: boolean;
  pin?: string;
  question_id?: string;
  text?: string;
  options?: string[];
  time_limit?: number;
  kind?: QuestionKind;
  image_url?: string | null;
  image_path?: string | null;
  skill?: string;
  started_at?: string;
  correct?: number | null;
};

export function secondsLeft(startedAt: string | undefined, limit: number | undefined, now: number) {
  if (!startedAt || !limit) return 0;
  const elapsed = (now - new Date(startedAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(limit - elapsed));
}

export function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : 0;
}