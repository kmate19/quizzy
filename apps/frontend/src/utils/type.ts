export interface quizUpload {
  description: string
  title: string
  status: "draft" | "published" | "requires_review" | "private"
  banner: string
  languageISOCodes: string[]
  tags: string[]
  cards: {
    question: string
    type: "normal" | "twochoice"
    answers: string[]
    picture: string
    correct_answer_index: number
  }[]
}



export interface quizSmallView {
  id: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  description: string;
  title: string;
  status: "draft" | "published" | "requires_review" | "private";
  rating: number;
  plays: number;
  banner: string;
  languages: string[]; 
  tags: string[];
}

export interface quizCardView {
  status: string
  id: string
  created_at: Date
  updated_at: Date
  title: string
  description: string
  rating: string
  plays: number
  banner: string
  languageISOCodes: string[]
  tags: string[]
  user_id: string
  cards: {
    question: string,
    type: string
    answers: string[],
    picture: string,
    correct_answer_index: number,
  }[]
}

export interface FuzzySearchOptionsForCard {
  threshold?: number
  caseSensitive?: boolean
  trimWhitespace?: boolean
  keys?: ((item: quizSmallView) => string | string[]) | keyof quizSmallView | (keyof quizSmallView)[]
}

export interface FuzzySearchResult<T> {
  item: T
  score: number
}
