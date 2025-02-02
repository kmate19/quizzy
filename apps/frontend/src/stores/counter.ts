import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Card } from '../utils/search'

const mockMockCards = ref<Card[]>([
  {
    name: 'Project Phoenix',
    desc: 'Develop a new mobile application for task management and collaboration. Json',
    category: 'Action',
    created_by: 'Alice Johnson',
  },
  {
    name: 'Website Redesign',
    desc: 'Revamp the company website for a modern and user-friendly experience. Json',
    category: 'Adventure',
    created_by: 'Bob Williams',
  },
  {
    name: 'Marketing Campaign - Summer Sale',
    desc: 'Plan and execute a summer sale marketing campaign across social media and email.',
    category: 'Casual',
    created_by: 'Charlie Davis',
  },
  {
    name: 'Database Optimization',
    desc: 'Optimize the database performance to improve application speed and efficiency.',
    category: 'Simulation',
    created_by: 'Diana Rodriguez',
  },
  {
    name: 'User Onboarding Flow Improvement',
    desc: 'Analyze and improve the user onboarding flow to increase user engagement.',
    category: 'Educational',
    created_by: 'Ethan Martinez',
  },
  {
    name: 'Security Audit',
    desc: 'Conduct a comprehensive security audit of the system to identify and fix vulnerabilities.',
    category: 'Trivia',
    created_by: 'Fiona Green',
  },
  {
    name: 'Content Creation - Blog Posts',
    desc: 'Create a series of blog posts on industry trends and best practices.',
    category: 'Horror',
    created_by: 'George Wilson',
  },
])


export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  function returnMockMockCards(){
    return mockMockCards
  }

  return { count, doubleCount, increment, returnMockMockCards }
})
