export interface Question {
  text: string
  type: '2 válaszos' | 'Normál'
  image: string
  answers: string[]
  correctAnswerIndex: number
}

export interface Quiz {
  image: string
  title: string
  desc: string
  category: string
  questions: Question[]
}

export interface Card {
  uuid: string
  image: string
  title: string
  category: string
  desc: string
  created_by: string
  questions: Question[]
  answerIndex: number
  status: string
}

export interface FuzzySearchOptionsForCard {
  threshold?: number
  caseSensitive?: boolean
  trimWhitespace?: boolean
  keys?: keyof Card | (keyof Card)[] | ((item: Card) => string | string[])
}

export interface FuzzySearchResult<T> {
  item: T
  score: number
}
