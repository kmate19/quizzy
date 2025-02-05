export interface quizUpload {
  title: string
  description: string
  status: string
  banner: string
  languages: string[]
  tags: string[]
  cards: {
    question: string
    type: string
    answers: string[]
    picture: string
    correct_answer_index: number
  }[]
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
  languages: string[]
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
  keys?: keyof quizCardView | (keyof quizCardView)[] | ((item: quizCardView) => string | string[])
}

export interface FuzzySearchResult<T> {
  item: T
  score: number
}
