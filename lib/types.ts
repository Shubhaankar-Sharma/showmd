export interface ShowMeta {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiffAnnotation {
  line: number;
  content: string;
  side?: "additions" | "deletions";
}

export interface DiffData {
  patch: string;
  filename?: string;
  annotations?: DiffAnnotation[];
}

export interface CreateShowRequest {
  title: string;
  description?: string;
  content: string;
  diffs?: Record<string, DiffData>;
}

export interface UpdateShowRequest {
  title?: string;
  description?: string;
  content?: string;
  diffs?: Record<string, DiffData>;
}
