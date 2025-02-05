import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Card } from "@/utils/type"

const mockMockCards = ref<Card[]>([
  {
    uuid: '1',
    image: 'https://www.w3schools.com/images/lamp.jpg',
    title: 'Project Phoenix',
    desc: 'Develop a new mobile application for task management and collaboration. Json Develop a new mobile application for task management and collaboration. Json  Develop a new mobile application for task management and collaboration. Json Develop a new mobile application for task management and collaboration. Json',
    category: 'Action',
    created_by: 'Alice Johnson',
    questions: [
      {
        text: 'What is the main goal of Project Phoenix?',
        type: 'Normál',
        image: 'https://via.placeholder.com/50',
        answers: ['Task Management', 'Collaboration', 'Mobile App Development', 'All of the above'],
        correctAnswerIndex: 3,
      },
    ],
    answerIndex: 0,
    status: 'draft'
  },
  {
    uuid: '2',
    image: 'https://www.w3schools.com/images/lamp.jpg',
    title: 'Website Redesign',
    desc: 'Revamp the company website for a modern and user-friendly experience. Json',
    category: 'vaddiszno',
    created_by: 'Bob Williams',
    questions: [
      {
        text: 'What is the purpose of the website redesign?',
        type: 'Normál',
        image: 'https://via.placeholder.com/50',
        answers: ['Modern Look', 'User-Friendly Experience', 'Increase Traffic', 'Both A and B'],
        correctAnswerIndex: 3,
      },
    ],
    answerIndex: 0,
    status: 'draft'
  },
  {
    uuid: '3',
    image: 'https://www.w3schools.com/images/lamp.jpg',
    title: 'Marketing Campaign - Summer Sale',
    desc: 'Plan and execute a summer sale marketing campaign across social media and email.',
    category: 'Casual',
    created_by: 'Charlie Davis',
    questions: [
      {
        text: 'Which channels will be used for the marketing campaign?',
        type: 'Normál',
        image: 'https://via.placeholder.com/50',
        answers: ['Social Media', 'Email', 'Print Ads', 'Both A and B'],
        correctAnswerIndex: 3,
      },
    ],
    answerIndex: 0,
    status: 'draft'
  },
  {
    uuid: '4',
    image: 'https://www.w3schools.com/images/lamp.jpg',
    title: 'Database Optimization',
    desc: 'Optimize the database performance to improve application speed and efficiency.',
    category: 'Simulation',
    created_by: 'Diana Rodriguez',
    questions: [
      {
        text: 'Why is database optimization important?',
        type: 'Normál',
        image: 'https://via.placeholder.com/50',
        answers: ['Improve Speed', 'Increase Efficiency', 'Reduce Costs', 'All of the above'],
        correctAnswerIndex: 3,
      },
    ],
    answerIndex: 0,
    status: 'active'
  },
  {
    uuid: '5',
    image: 'https://www.w3schools.com/images/lamp.jpg', 
    title: 'User Onboarding Flow Improvement',
    desc: 'Analyze and improve the user onboarding flow to increase user engagement.',
    category: 'Educational',
    created_by: 'Ethan Martinez',
    questions: [
      {
        text: 'What is the goal of improving the user onboarding flow?',
        type: 'Normál',
        image: 'https://via.placeholder.com/50',
        answers: ['Increase Sign-ups', 'Improve Engagement', 'Reduce Churn', 'All of the above'],
        correctAnswerIndex: 3,
      },
    ],
    answerIndex: 0,
    status: 'draft'
  },
  {
    uuid: '6',
    image: 'https://www.w3schools.com/images/lamp.jpg',
    title: 'Security Audit',
    desc: 'Conduct a comprehensive security audit of the system to identify and fix vulnerabilities.',
    category: 'Trivia',
    created_by: 'Fiona Green',
    questions: [
      {
        text: 'What is the purpose of a security audit?',
        type: 'Normál',
        image: 'https://via.placeholder.com/50',
        answers: ['Identify Vulnerabilities', 'Fix Vulnerabilities', 'Improve Security', 'All of the above'],
        correctAnswerIndex: 0,
      },
    ],
    answerIndex: 0,
    status: 'draft'
  },
  {
    uuid: '7', 
    image: 'https://www.w3schools.com/images/lamp.jpg', 
    title: 'Content Creation - Blog Posts',
    desc: 'Create a series of blog posts on industry trends and best practices.',
    category: 'Horror',
    created_by: 'George Wilson',
    questions: [
      {
        text: 'What is the purpose of the blog posts?',
        type: 'Normál',
        image: 'https://via.placeholder.com/50',
        answers: ['Share Industry Trends', 'Share Best Practices', 'Increase Website Traffic', 'All of the above'],
        correctAnswerIndex: 3,
      },
    ],
    answerIndex: 0,
    status: 'active'
  },
]);




export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  function returnMockMockCards(){
    return mockMockCards
  }
  function returnMockCardByUuid(id: string) {
    return mockMockCards.value.find((q: Card) => q.uuid === id)
  }

  return { count, doubleCount, increment, returnMockMockCards, returnMockCardByUuid }
})
