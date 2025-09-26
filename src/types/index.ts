export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  created_by: number | null;
}

export interface Message {
  id: number;
  group_id: number;
  user_id: number | null;
  content: string;
  created_at: string;
}

export interface Note {
  id: number;
  group_id: number;
  user_id: number | null;
  content: { type: "text"; text: string }[];
  updated_at: string;
}
