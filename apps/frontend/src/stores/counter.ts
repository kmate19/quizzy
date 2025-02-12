import { defineStore } from 'pinia'
import type { quizSmallView } from '@/utils/type'
import { ref, computed } from 'vue';
import { clientv1 } from '@/lib/apiClient';

const getAll = async () => {
  const res = await clientv1.quizzes.$get({query: { limit: "10", page: "1" }})
  const data = await res.json()
  console.log(data.data)//needs to do some things with this
}
getAll()

const mockQuizData = ref<quizSmallView[]>([])


const isoCodes = [
  'HU',
  'EN',
  'GE',
  'JP',
  'AF',
  'DN',
  'AX',
  'AR',
  'ES',
  'RO',
  'RU',
  'US',
  'CA',
  'GB',
  'FR',
  'DE',
  'IT',
  'CN',
  'IN',
  'BR',
  'MX',
  'AU',
  'ZA',
  'KR',
  'SE',
  'NL',
  'BE',
  'CH',
  'AT',
  'NO',
  'PL',
  'GR',
  'PT',
]

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  function returnMockMockCards() {
    return mockQuizData
  }
  function returnIsoCards() {
    return isoCodes
  }
  function returnAllTags() {
    const allTagsArrays = mockQuizData.value.map((card: quizSmallView) => card.tags)
    const allTags: string[] = []

    for (const tags of allTagsArrays) {
      allTags.push(...tags)
    }

    return [...new Set(allTags)]
  }
  function returnMockCardByUuid(id: string) {
    const quiz = mockQuizData.value.find((q) => q.id === id)
    if (!quiz) return null
    return {
      title: quiz.title,
      description: quiz.description,
      status: quiz.status,
      banner: quiz.banner,
      languages: quiz.languages,
      tags: quiz.tags,
    }
  }

  return {
    count,
    doubleCount,
    increment,
    returnMockMockCards,
    returnMockCardByUuid,
    returnIsoCards,
    returnAllTags,
  }
})
