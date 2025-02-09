import { defineStore } from 'pinia'
import type { quizSmallView } from '@/utils/type'
import { ref, computed } from 'vue';

const mockQuizData = ref<quizSmallView[]>([
  {
    id: 'quiz-1',
    created_at: new Date('2024-01-26T10:00:00Z'),
    updated_at: new Date('2024-01-26T10:30:00Z'),
    user_id: 'user-1',
    description: "Test your knowledge of ancient Roman history. From the founding of Rome to the fall of the Western Empire, this quiz covers key events, figures, and cultural aspects of one of history's most influential civilizations. Explore topics such as the Punic Wars, the Roman Republic, the rise and fall of emperors, and the legacy of Roman law, architecture, and language.  Challenge yourself with questions on Julius Caesar, Augustus, Hadrian's Wall, the Colosseum, and more.  A perfect quiz for history buffs and students alike!",
    title: 'Ancient Rome: A Historical Journey',
    status: 'published',
    rating: 4.5,
    plays: 1250,
    banner: 'https://example.com/rome_banner.jpg',
    languages: ['English', 'Spanish', 'French'],
    tags: ['history', 'ancient history', 'rome', 'roman empire', 'julius caesar', 'augustus', 'colosseum', 'republic', 'empire'],
  },
  {
    id: 'quiz-2',
    created_at: new Date('2024-01-25T15:00:00Z'),
    updated_at: new Date('2024-01-25T15:45:00Z'),
    user_id: 'user-2',
    description: "Delve into the fascinating world of molecular biology. This quiz tests your understanding of DNA structure, replication, transcription, and translation.  Explore the central dogma of molecular biology and challenge yourself with questions on genetic engineering, gene expression, protein synthesis, and the role of enzymes.  Designed for students and enthusiasts of biology, biochemistry, and genetics.  Unravel the mysteries of life at the molecular level!",
    title: 'Molecular Biology: The Code of Life',
    status: 'published',
    rating: 4.2,
    plays: 980,
    banner: 'https://example.com/dna_banner.jpg',
    languages: ['English', 'German'],
    tags: ['biology', 'molecular biology', 'dna', 'genetics', 'gene expression', 'protein synthesis', 'replication', 'transcription'],
  },
  {
    id: 'quiz-3',
    created_at: new Date('2024-01-24T08:00:00Z'),
    updated_at: new Date('2024-01-24T08:30:00Z'),
    user_id: 'user-3',
    description: "Test your knowledge of programming fundamentals with this comprehensive quiz. Covering concepts like variables, data types, control structures (if/else, loops), functions, and basic algorithms, this quiz is perfect for beginners and experienced programmers alike. Practice your skills in problem-solving, code readability, and algorithmic thinking.  Explore questions on common programming paradigms, debugging techniques, and best practices for writing clean and efficient code. Get ready to sharpen your coding skills!",
    title: 'Programming Fundamentals: A Beginner\'s Guide',
    status: 'published',
    rating: 4.7,
    plays: 1520,
    banner: 'https://example.com/programming_banner.jpg',
    languages: ['English', 'Chinese'],
    tags: ['programming', 'fundamentals', 'coding', 'algorithms', 'data structures', 'variables', 'functions', 'control structures', 'debugging'],
  },
  {
    id: 'quiz-4',
    created_at: new Date('2024-01-23T12:00:00Z'),
    updated_at: new Date('2024-01-23T12:45:00Z'),
    user_id: 'user-1',
    description: "Explore the art of digital photography with this engaging quiz.  Learn about camera settings, composition techniques, lighting principles, and post-processing workflows.  Discover how to capture stunning landscapes, portraits, and action shots.  Test your knowledge of aperture, shutter speed, ISO, white balance, and various lens types.  Enhance your photography skills and unlock your creative potential!",
    title: 'Digital Photography: Capturing the Moment',
    status: 'published',
    rating: 4.3,
    plays: 890,
    banner: 'https://example.com/photography_banner.jpg',
    languages: ['English'],
    tags: ['photography', 'digital photography', 'camera', 'composition', 'lighting', 'post-processing', 'aperture', 'shutter speed', 'iso'],
  },
  {
    id: 'quiz-5',
    created_at: new Date('2024-01-22T09:00:00Z'),
    updated_at: new Date('2024-01-22T09:30:00Z'),
    user_id: 'user-2',
    description: "Uncover the mysteries of the universe with this astronomy quiz. From planets and stars to galaxies and black holes, explore the wonders of space. Test your knowledge of the solar system, constellations, nebulae, and the Big Bang theory. Discover the latest astronomical discoveries and learn about the tools and techniques used by astronomers to explore the cosmos. Prepare to be amazed by the vastness and beauty of the universe!",
    title: 'Astronomy: Exploring the Cosmos',
    status: 'published',
    rating: 4.6,
    plays: 1120,
    banner: 'https://example.com/astronomy_banner.jpg',
    languages: ['English'],
    tags: ['astronomy', 'space', 'planets', 'stars', 'galaxies', 'black holes', 'solar system', 'constellations', 'nebulae', 'big bang'],
  },
  {
    id: 'quiz-6',
    created_at: new Date('2024-01-21T14:00:00Z'),
    updated_at: new Date('2024-01-21T14:45:00Z'),
    user_id: 'user-3',
    description: "Dive into the world of web development with this comprehensive quiz. Test your skills in HTML, CSS, and JavaScript, the building blocks of the web.  Explore topics such as responsive design, front-end frameworks, and back-end technologies.  Challenge yourself with questions on DOM manipulation, AJAX requests, and server-side scripting.  Become a web development pro!",
    title: 'Web Development: Building the Web',
    status: 'published',
    rating: 4.4,
    plays: 1050,
    banner: 'https://example.com/webdev_banner.jpg',
    languages: ['English'],
    tags: ['web development', 'html', 'css', 'javascript', 'responsive design', 'front-end', 'back-end', 'dom manipulation', 'ajax'],
  },
  {
    id: 'quiz-7',
    created_at: new Date('2024-01-20T11:00:00Z'),
    updated_at: new Date('2024-01-20T11:30:00Z'),
    user_id: 'user-1',
    description: "Explore the rich history of jazz music with this engaging quiz. From its origins in African American communities to its global influence, discover the key figures, styles, and innovations of this uniquely American art form. Test your knowledge of swing, bebop, cool jazz, and fusion. Learn about legendary musicians like Louis Armstrong, Duke Ellington, Charlie Parker, and Miles Davis. Immerse yourself in the vibrant sounds of jazz!",
    title: 'Jazz Music: A Historical Journey',
    status: 'published',
    rating: 4.8,
    plays: 1380,
    banner: 'https://example.com/jazz_banner.jpg',
    languages: ['English'],
    tags: ['jazz', 'music', 'history', 'swing', 'bebop', 'louis armstrong', 'duke ellington', 'charlie parker', 'miles davis'],
  },
  {
    id: 'quiz-8',
    created_at: new Date('2024-01-19T16:00:00Z'),
    updated_at: new Date('2024-01-19T16:45:00Z'),
    user_id: 'user-2',
    description: "Sharpen your logic and reasoning skills with this challenging quiz. Solve puzzles, analyze arguments, and identify fallacies. Test your knowledge of deductive and inductive reasoning, critical thinking, and problem-solving techniques.  Improve your ability to think clearly and make sound judgments. This quiz is perfect for students, professionals, and anyone who wants to enhance their cognitive abilities.",
    title: 'Logic and Reasoning: Thinking Clearly',
    status: 'published',
    rating: 4.5,
    plays: 920,
    banner: 'https://example.com/logic_banner.jpg',
    languages: ['English'],
    tags: ['logic', 'reasoning', 'critical thinking', 'problem-solving', 'deductive reasoning', 'inductive reasoning', 'fallacies', 'puzzles'],
  },
  {
    id: 'quiz-9',
    created_at: new Date('2024-01-18T13:00:00Z'),
    updated_at: new Date('2024-01-18T13:30:00Z'),
    user_id: 'user-3',
    description: "Explore the world of graphic design with this creative quiz. Learn about design principles, typography, color theory, and layout techniques. Discover how to create visually appealing and effective designs for print and digital media.  Test your knowledge of Adobe Photoshop, Illustrator, and InDesign. Unleash your inner artist and become a graphic design master!",
    title: 'Graphic Design: Creating Visuals',
    status: 'published',
    rating: 4.7,
    plays: 1290,
    banner: 'https://example.com/graphicdesign_banner.jpg',
    languages: ['English'],
    tags: ['graphic design', 'design principles', 'typography', 'color theory', 'layout', 'photoshop', 'illustrator', 'indesign'],
  },
  {
    id: 'quiz-10',
    created_at: new Date('2024-01-17T10:00:00Z'),
    updated_at: new Date('2024-01-17T10:45:00Z'),
    user_id: 'user-1',
    description: "Test your understanding of the English language with this comprehensive quiz. Covering grammar, vocabulary, punctuation, and writing skills, this quiz is perfect for students, writers, and anyone who wants to improve their communication skills. Explore topics such as sentence structure, verb tenses, parts of speech, and common errors.  Enhance your language proficiency and become a wordsmith!",
    title: 'English Language: Mastering the Basics',
    status: 'published',
    rating: 4.6,
    plays: 1150,
    banner: 'https://example.com/english_banner.jpg',
    languages: ['English'],
    tags: ['english', 'language', 'grammar', 'vocabulary', 'punctuation', 'writing', 'sentence structure', 'verb tenses', 'parts of speech'],
  }
])

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
