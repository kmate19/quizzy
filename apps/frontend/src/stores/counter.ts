import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { quizCardView } from '@/utils/type'

const mockQuizCardViews = ref<quizCardView[]>([
  {
    status: 'active',
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    created_at: new Date('2023-10-26T10:00:00Z'),
    updated_at: new Date('2023-10-27T14:30:00Z'),
    title: 'General Knowledge Quiz',
    description: 'Test your general knowledge with this challenging quiz.',
    rating: '4.5',
    plays: 150,
    banner: 'https://example.com/banner1.jpg',
    languages: ['en', 'es'],
    tags: ['general knowledge', 'trivia', 'fun'],
    user_id: 'user123',
    cards: [
      {
        question: 'What is the capital of France?',
        type: 'multiple-choice', // Example type
        answers: ['London', 'Paris', 'Berlin', 'Rome'],
        picture: 'https://example.com/paris.jpg',
        correct_answer_index: 1,
      },
      {
        question: 'What is the highest mountain in the world?',
        type: 'multiple-choice', // Example type
        answers: ['K2', 'Kangchenjunga', 'Matterhorn', 'Mount Everest'],
        picture: 'https://example.com/everest.jpg',
        correct_answer_index: 3,
      },
    ],
  },
  {
    status: 'draft',
    id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    created_at: new Date('2023-10-25T15:00:00Z'),
    updated_at: new Date('2023-10-25T15:00:00Z'),
    title: 'History of Ancient Rome',
    description: 'A quiz about the history of ancient Rome.',
    rating: '4.0',
    plays: 75,
    banner: 'https://example.com/banner2.jpg',
    languages: ['en'],
    tags: ['history', 'ancient rome', 'roman empire'],
    user_id: 'user456',
    cards: [
      {
        question: 'Who was the first Roman Emperor?',
        type: 'multiple-choice', // Example type
        answers: ['Julius Caesar', 'Augustus', 'Nero', 'Trajan'],
        picture: 'https://example.com/augustus.jpg',
        correct_answer_index: 1,
      },
      {
        question: 'What year did the Roman Empire fall?',
        type: 'multiple-choice', // Example type
        answers: ['476 AD', '395 AD', '1453 AD', '1066 AD'],
        picture: 'https://example.com/rome_fall.jpg',
        correct_answer_index: 0,
      },
    ],
  },
  {
    status: 'active',
    id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12',
    created_at: new Date('2023-10-24T09:00:00Z'),
    updated_at: new Date('2023-10-28T11:00:00Z'),
    title: 'Science Quiz',
    description: 'Test your knowledge of science topics.',
    rating: '4.8',
    plays: 220,
    banner: 'https://example.com/banner3.jpg',
    languages: ['en', 'fr'],
    tags: ['science', 'biology', 'chemistry', 'physics'],
    user_id: 'user789',
    cards: [
      {
        question: 'What is the chemical symbol for water?',
        type: 'multiple-choice', // Example type
        answers: ['H2O', 'CO2', 'NaCl', 'O2'],
        picture: 'https://example.com/water.jpg',
        correct_answer_index: 0,
      },
      {
        question: 'What is the speed of light?',
        type: 'multiple-choice', // Example type
        answers: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '200,000 km/s'],
        picture: 'https://example.com/light.jpg',
        correct_answer_index: 0,
      },
    ],
  },
]);

const isoCodes = ['HU','EN','GE']

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  function returnMockMockCards() {
    return mockQuizCardViews
  }
  function returnIsoCards() {
    return isoCodes
  }
  function returnAllTags() {
    const allTagsArrays = mockQuizCardViews.value.map((card) => card.tags);
    const allTags: string[] = [];
  
    for (const tags of allTagsArrays) {
      allTags.push(...tags);
    }
  
    return [...new Set(allTags)]; 
  };
  function returnMockCardByUuid(id: string) {
    const quiz = mockQuizCardViews.value.find((q: quizCardView) => q.id === id)
    if (!quiz) return null
    return {
      title: quiz.title,
      description: quiz.description,
      status: quiz.status,
      banner: quiz.banner,
      languages: quiz.languages,
      tags: quiz.tags,
      cards: quiz.cards,
    }
  }

  return { count, doubleCount, increment, returnMockMockCards, returnMockCardByUuid, returnIsoCards, returnAllTags }
})
