export interface quizUpload {
  description: string
  title: string
  status: 'draft' | 'published' | 'requires_review' | 'private'
  banner: string
  languageISOCodes: string[]
  tags: string[]
  cards: {
    question: string
    type: 'normal' | 'twochoice'
    answers: string[]
    picture: string
    correct_answer_index: number
  }[]
}

export interface Question {
  question: string
  type: 'twochoice' | 'normal'
  answers: string[]
  picture: string
  correct_answer_index: number
}

export interface quizCardView {
  status: string
  created_at: Date
  updated_at: Date
  title: string
  quiz_id: string
  description: string
  rating: string
  plays: string
  banner: string
  username: string
  languageISOCodes: {
    iso_code: string
    icon: string
  }[]
  tags: string[]
  user_id: string
  cards: {
    question: string
    type: string
    answers: string[]
    picture: string
    correct_answer_index: number
  }[]
}

export interface Tag {
  name: string
}

export interface Language {
  name?: string
  iso_code: string
  icon: string
  support?: 'none' | 'official' | 'partial'
}

export interface Quiz {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  description: string
  title: string
  status?: 'published' | 'draft' | 'requires_review' | 'private'
  rating: number
  plays: number
  banner: string
  languages: Language[]
  tags: Tag[]
}

export interface sentFriendship {
  created_at: string
  status: 'pending' | 'blocked' | 'accepted'
  addressee: {
    id: string
    username: string
    activity_status: 'active' | 'inactive' | 'away'
    profile_picture: {
      type: 'Buffer'
      data: number[]
    } | null
  }
}

export interface recievedFriendships {
  created_at: string
  status: 'pending' | 'blocked' | 'accepted'
  requester: {
    id: string
    username: string
    activity_status: 'active' | 'inactive' | 'away'
    profile_picture: {
      type: 'Buffer'
      data: number[]
    } | null
  }
}

export interface stats {
    plays: number,
    first_places: number,
    second_places: number,
    third_places: number,
    wins: number,
    losses: number,
}

export interface userProfile{
  email: string
  username: string
  created_at: string
  activity_status: string
  profile_picture: string
  sentFriendships: sentFriendship[]        // Adjust these types if you have more specific types
  recievedFriendships: recievedFriendships[]
  friends: sentFriendship[]
  role: string
  stats: stats  
}
