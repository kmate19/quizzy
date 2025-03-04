export type quizUpload = {
  description: string
  title: string
  status: 'draft' | 'published' | 'requires_review' | 'private'
  banner: string
  languageISOCodes: [string,...string[]] | undefined
  tags: [string,...string[]] | undefined
  cards: nonemptyCardArray
}

export type cardType = {
  question: string
  type: 'normal' | 'twochoice'
  answers: string[]
  picture: string
  correct_answer_index: number
}

export type nonemptyCardArray = [cardType, ...cardType[]]

export type Question = {
  question: string
  type: 'twochoice' | 'normal'
  answers: string[]
  picture: string
  correct_answer_index: number
}

export type quizCardView = {
  id: string
  created_at: string
  updated_at: string
  title: string
  quiz_id: string
  description: string
  rating: number
  plays: number
  banner: string
  username: string
  languages: Language[]
  tags: Tag[]
  user_id: string
}

export type Tag = {
  name: string
}

export type Language = {
  name?: string
  iso_code: string
  icon: string
  support?: 'none' | 'official' | 'partial'
}

export type detailedQuiz = {
  id: string
  created_at: string
  updated_at: string
  username: string
  user_id: string
  description: string
  title: string
  cards: Question[]
  status?: 'published' | 'draft' | 'requires_review' | 'private'
  rating: number
  plays: number
  banner: string
  languages: Language[]
  tags: Tag[]
}

export type sentFriendship = {
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

export type recievedFriendships = {
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

export type stats = {
    plays: number,
    first_places: number,
    second_places: number,
    third_places: number,
    wins: number,
    losses: number,
}

type role = {
  role: {
    name: string
  }
}

export type userProfile = {
  email?: string
  username: string
  created_at: string
  activity_status: string
  profile_picture: string
  sentFriendships?: sentFriendship[]
  recievedFriendships?: recievedFriendships[]
  friends?: sentFriendship[]
  roles: role[]
  stats: stats  
}

export type Game = {
  title: string;
  banner: string;
  description: string;
  cards: Question[];
}

