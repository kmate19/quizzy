import { defineStore } from 'pinia'
import type { quizSmallView } from '@/utils/type'
import { ref } from 'vue';

const quizies = ref<quizSmallView[]>([])

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
  function returnQuizies() {
    return quizies
  }
  function returnIsoCards() {
    return isoCodes
  }
  function returnAllTags() {
    const allTagsArrays = quizies.value.map((card: quizSmallView) => card.tags)
    const allTags: string[] = []

    for (const tags of allTagsArrays) {
      allTags.push(...tags)
    }

    return [...new Set(allTags)]
  }


  return {
    returnQuizies,
    returnIsoCards,
    returnAllTags,
  }
})
