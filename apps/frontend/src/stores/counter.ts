import { defineStore } from 'pinia'
import type { quizCardView } from '@/utils/type'
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const mockQuizCardViews = ref<quizCardView[]>([
  {
    status: 'active',
    id: uuidv4(),
    created_at: new Date('2023-10-26T10:00:00Z'),
    updated_at: new Date('2023-10-27T14:30:00Z'),
    title: 'General Knowledge Extravaganza',
    description: 'Challenge your intellect with this wide-ranging general knowledge quiz! From the depths of history to the latest in science and the heights of cultural achievements, this quiz will put your knowledge to the ultimate test.  Perfect for trivia enthusiasts and knowledge seekers alike.  Sharpen your mind and impress your friends with your newfound brilliance! Prepare to delve into diverse subjects and expand your understanding of the world around you.',
    rating: '4.5',
    plays: 150,
    banner: 'https://placehold.co/600x200/4A90E2/FFFFFF?text=General+Knowledge',
    languages: ['en', 'es'],
    tags: ['general knowledge', 'trivia', 'fun', 'geography', 'history', 'science', 'pop culture', 'random facts'],
    user_id: 'user123',
    cards: [
      {
        question: 'What is the capital of France?',
        type: 'multiple-choice',
        answers: ['London', 'Paris', 'Berlin', 'Rome'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=France',
        correct_answer_index: 1,
      },
      {
        question: 'What is the highest mountain in the world?',
        type: 'multiple-choice',
        answers: ['K2', 'Kangchenjunga', 'Matterhorn', 'Mount Everest'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Everest',
        correct_answer_index: 3,
      },
    ],
  },
  {
    status: 'draft',
    id: uuidv4(),
    created_at: new Date('2023-10-25T15:00:00Z'),
    updated_at: new Date('2023-10-25T15:00:00Z'),
    title: 'History of Ancient Rome: From Republic to Empire',
    description: 'Journey back in time to the era of emperors, legions, and gladiators with this captivating quiz on Ancient Rome.  Explore the rise and fall of the Roman Republic, the expansion of the Roman Empire, and the key figures who shaped its destiny.  From Romulus and Remus to Julius Caesar and Augustus, test your knowledge of the personalities and events that defined one of history\'s greatest civilizations. Unearth the secrets of the past and become a Roman history expert!',
    rating: '4.0',
    plays: 75,
    banner: 'https://placehold.co/600x200/F44336/FFFFFF?text=Ancient+Rome',
    languages: ['en'],
    tags: ['history', 'ancient rome', 'roman empire', 'republic', 'emperor', 'gladiators', 'legions'],
    user_id: 'user456',
    cards: [
      {
        question: 'Who was the first Roman Emperor?',
        type: 'multiple-choice',
        answers: ['Julius Caesar', 'Augustus', 'Nero', 'Trajan'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Augustus',
        correct_answer_index: 1,
      },
      {
        question: 'What year did the Roman Empire fall?',
        type: 'multiple-choice',
        answers: ['476 AD', '395 AD', '1453 AD', '1066 AD'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Fall+of+Rome',
        correct_answer_index: 0,
      },
    ],
  },
  {
    status: 'active',
    id: uuidv4(),
    created_at: new Date('2023-10-24T09:00:00Z'),
    updated_at: new Date('2023-10-28T11:00:00Z'),
    title: 'Science Explorers Quiz: From Atoms to Galaxies',
    description: 'Embark on a scientific adventure with this engaging quiz covering a wide range of scientific disciplines. From the fundamental building blocks of matter in chemistry and physics to the intricacies of life in biology and the vastness of the universe in astronomy, challenge yourself with thought-provoking questions. Explore scientific concepts, discover the wonder of the natural world, and enhance your knowledge of the world of science! Are you ready to unlock the secrets of the cosmos and the intricacies of life?',
    rating: '4.8',
    plays: 220,
    banner: 'https://placehold.co/600x200/8BC34A/FFFFFF?text=Science+Quiz',
    languages: ['en', 'fr'],
    tags: ['science', 'biology', 'chemistry', 'physics', 'astronomy', 'nature', 'experiments'],
    user_id: 'user789',
    cards: [
      {
        question: 'What is the chemical symbol for water?',
        type: 'multiple-choice',
        answers: ['H2O', 'CO2', 'NaCl', 'O2'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Water',
        correct_answer_index: 0,
      },
      {
        question: 'What is the speed of light?',
        type: 'multiple-choice',
        answers: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '200,000 km/s'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Light',
        correct_answer_index: 0,
      },
    ],
  },
  {
    status: 'active',
    id: uuidv4(),
    created_at: new Date('2023-11-01T12:00:00Z'),
    updated_at: new Date('2023-11-02T18:45:00Z'),
    title: 'Movie Buff Challenge: Lights, Camera, Quiz!',
    description: 'Calling all cinephiles!  Test your film knowledge with this ultimate movie quiz! Spanning genres from classic Hollywood to modern indie hits, this quiz covers it all.  Can you identify the director, the actors, the quotes, and the plot points?  Put your movie expertise to the test and prove you are the ultimate movie buff.  Get ready to relive your favorite moments and discover new cinematic treasures!',
    rating: '4.9',
    plays: 312,
    banner: 'https://placehold.co/600x200/9C27B0/FFFFFF?text=Movie+Quiz',
    languages: ['en'],
    tags: ['movies', 'film', 'cinema', 'hollywood', 'actors', 'directors', 'quotes', 'trivia'],
    user_id: 'user246',
    cards: [
      {
        question: 'Who directed "Pulp Fiction"?',
        type: 'multiple-choice',
        answers: ['Steven Spielberg', 'Quentin Tarantino', 'Christopher Nolan', 'Martin Scorsese'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Pulp+Fiction',
        correct_answer_index: 1,
      },
      {
        question: 'Which actor played James Bond in "Casino Royale" (2006)?',
        type: 'multiple-choice',
        answers: ['Pierce Brosnan', 'Sean Connery', 'Daniel Craig', 'Roger Moore'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Casino+Royale',
        correct_answer_index: 2,
      },
    ],
  },
  {
    status: 'active',
    id: uuidv4(),
    created_at: new Date('2023-11-05T08:30:00Z'),
    updated_at: new Date('2023-11-05T16:15:00Z'),
    title: 'Music Mania: A Harmonious Quiz Adventure',
    description: 'Are you a true music aficionado? From classical compositions to chart-topping pop anthems, this quiz will test your knowledge of all things music.  Identify the artist, the song, the album, and the genre.  Rock out to the classics and groove to the new releases!  See if you have what it takes to be a music trivia master. From Beethoven to Billie Eilish, explore the sounds of the ages and prove you’re a real music guru!.',
    rating: '4.7',
    plays: 188,
    banner: 'https://placehold.co/600x200/673AB7/FFFFFF?text=Music+Quiz',
    languages: ['en'],
    tags: ['music', 'songs', 'artists', 'albums', 'genre', 'pop', 'rock', 'classical', 'hip hop'],
    user_id: 'user802',
    cards: [
      {
        question: 'Who sang "Bohemian Rhapsody"?',
        type: 'multiple-choice',
        answers: ['The Rolling Stones', 'Queen', 'The Beatles', 'Pink Floyd'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Bohemian+Rhapsody',
        correct_answer_index: 1,
      },
      {
        question: 'What year was the album "Thriller" by Michael Jackson released?',
        type: 'multiple-choice',
        answers: ['1979', '1982', '1984', '1986'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Thriller',
        correct_answer_index: 1,
      },
    ],
  },
    {
    status: 'active',
    id: uuidv4(),
    created_at: new Date('2023-11-05T08:30:00Z'),
    updated_at: new Date('2023-11-05T16:15:00Z'),
    title: 'Sports Stars and Records',
    description: 'Test your sports knowledge with this sports quiz! Do you know your Messi from your Michael Jordan? What about your Olympic records. Get ready to show off your knowlege',
    rating: '4.2',
    plays: 188,
    banner: 'https://placehold.co/600x200/673AB7/FFFFFF?text=Sports+Quiz',
    languages: ['en'],
    tags: ['sports', 'football', 'soccer', 'basketball', 'NFL', 'NBA', 'Olympics'],
    user_id: 'user802',
    cards: [
      {
        question: 'Who has won the most Ballon Dors',
        type: 'multiple-choice',
        answers: ['Pele', 'Maradona', 'Messi', 'Ronaldo'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Messi',
        correct_answer_index: 2,
      },
      {
        question: 'Who is the NBA all time scoring leader',
        type: 'multiple-choice',
        answers: ['Michael Jordan', 'LeBron James', 'Kareem Abdul-Jabbar', 'Kobe Bryant'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=LeBron',
        correct_answer_index: 1,
      },
    ],
  },
  {
    status: 'draft',
    id: uuidv4(),
    created_at: new Date('2023-11-08T10:00:00Z'),
    updated_at: new Date('2023-11-08T10:00:00Z'),
    title: 'The Great British Baking Show Quiz',
    description: 'For fans of the British Baking Show and baking in general, this quiz is a must try! Find out how you compare to the judges. Test your baking knowlege now!',
    rating: '3.9',
    plays: 22,
    banner: 'https://placehold.co/600x200/009688/FFFFFF?text=Baking+Quiz',
    languages: ['en'],
    tags: ['baking', 'british baking show', 'GBBS', 'cakes', 'pastries', 'recipes'],
    user_id: 'user333',
    cards: [
      {
        question: 'Which of these is NOT a type of meringue?',
        type: 'multiple-choice',
        answers: ['French', 'Italian', 'Swiss', 'German'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Meringue',
        correct_answer_index: 3,
      },
      {
        question: 'What is the main ingredient in shortbread?',
        type: 'multiple-choice',
        answers: ['Flour', 'Sugar', 'Butter', 'Eggs'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Shortbread',
        correct_answer_index: 2,
      },
    ],
  },
  {
    status: 'active',
    id: uuidv4(),
    created_at: new Date('2023-11-10T14:00:00Z'),
    updated_at: new Date('2023-11-11T09:30:00Z'),
    title: 'World Capitals and Landmarks',
    description: 'Explore the globe from the comfort of your home! This quiz will challenge your knowledge of world capitals and famous landmarks. From the Eiffel Tower to the Great Wall of China, can you identify the location and significance of these iconic places? Become a virtual world traveler and impress your friends with your global knowledge. Are you ready for your around-the-world adventure?  Prepare to explore new horizons and expand your understanding of our diverse planet!',
    rating: '4.6',
    plays: 95,
    banner: 'https://placehold.co/600x200/FF9800/FFFFFF?text=World+Quiz',
    languages: ['en', 'fr', 'es'],
    tags: ['world', 'capitals', 'landmarks', 'geography', 'travel', 'culture', 'cities', 'tourism'],
    user_id: 'user555',
    cards: [
      {
        question: 'What is the capital of Australia?',
        type: 'multiple-choice',
        answers: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Australia',
        correct_answer_index: 2,
      },
      {
        question: 'In which city is the Colosseum located?',
        type: 'multiple-choice',
        answers: ['Athens', 'Rome', 'Paris', 'London'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Colosseum',
        correct_answer_index: 1,
      },
    ],
  },
  {
    status: 'active',
    id: uuidv4(),
    created_at: new Date('2023-11-12T11:00:00Z'),
    updated_at: new Date('2023-11-13T15:00:00Z'),
    title: 'Coding Conundrums: A Programmer\'s Paradise',
    description: 'Dive into the world of code with this challenging quiz for programmers and tech enthusiasts! From fundamental programming concepts to advanced algorithms and data structures, test your coding skills.  Do you know your Python from your JavaScript? Can you debug complex code and solve intricate problems?  Prove your coding prowess and climb the leaderboard.  Get ready to sharpen your coding chops and showcase your talent!',
    rating: '4.4',
    plays: 62,
    banner: 'https://placehold.co/600x200/3F51B5/FFFFFF?text=Coding+Quiz',
    languages: ['en'],
    tags: ['coding', 'programming', 'algorithms', 'data structures', 'python', 'javascript', 'web development', 'software'],
    user_id: 'user999',
    cards: [
      {
        question: 'What does HTML stand for?',
        type: 'multiple-choice',
        answers: ['Hyper Text Markup Language', 'Highly Technical Machine Language', 'Home Tool Markup Language', 'Hyperlink and Text Management Language'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=HTML',
        correct_answer_index: 0,
      },
      {
        question: 'What is the purpose of a loop in programming?',
        type: 'multiple-choice',
        answers: ['To define a variable', 'To execute a block of code repeatedly', 'To display a message on the screen', 'To create a new function'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Loop',
        correct_answer_index: 1,
      },
    ],
  },
  {
    status: 'active',
    id: uuidv4(),
    created_at: new Date('2023-11-15T07:00:00Z'),
    updated_at: new Date('2023-11-16T12:30:00Z'),
    title: 'Art Masterpiece Mania',
    description: 'Delve into the world of artistic brilliance. Test your knowledge with this masterpiece test! Who were the greatest artists of all time?',
    rating: '4.1',
    plays: 110,
    banner: 'https://placehold.co/600x200/795548/FFFFFF?text=Art+Quiz',
    languages: ['en'],
    tags: ['art', 'paintings', 'artists', 'renaissance', 'impressionism', 'sculptures', 'museums'],
    user_id: 'user111',
    cards: [
      {
        question: 'Who painted the Mona Lisa?',
        type: 'multiple-choice',
        answers: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Mona+Lisa',
        correct_answer_index: 1,
      },
      {
        question: 'What is the name of the famous sculpture by Michelangelo in Florence?',
        type: 'multiple-choice',
        answers: ['The Thinker', 'David', 'Venus de Milo', 'The Discus Thrower'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=David',
        correct_answer_index: 1,
      },
    ],
  },
  {
    status: 'active',
    id: uuidv4(),
    created_at: new Date('2023-11-17T16:00:00Z'),
    updated_at: new Date('2023-11-18T10:15:00Z'),
    title: 'Geography Whiz Challenge',
    description: 'Put your geography skills to the ultimate test! From the world\'s largest countries to the smallest island nations, explore the diverse landscapes and cultures of our planet.  Can you identify the countries, capitals, rivers, and mountain ranges? Explore the geography, of the whole world.',
    rating: '4.3',
    plays: 78,
    banner: 'https://placehold.co/600x200/CDDC39/000000?text=Geography+Quiz',
    languages: ['en', 'es'],
    tags: ['geography', 'countries', 'capitals', 'rivers', 'mountains', 'continents', 'maps', 'globe'],
    user_id: 'user777',
    cards: [
      {
        question: 'What is the longest river in the world?',
        type: 'multiple-choice',
        answers: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Amazon',
        correct_answer_index: 0,
      },
      {
        question: 'Which continent is the Sahara Desert located in?',
        type: 'multiple-choice',
        answers: ['Asia', 'South America', 'Africa', 'Australia'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=Sahara',
        correct_answer_index: 2,
      },
    ],
  },

   {
    status: 'active',
    id: uuidv4(),
    created_at: new Date('2023-11-17T16:00:00Z'),
    updated_at: new Date('2023-11-18T10:15:00Z'),
    title: 'Cryptocurrency Craze',
    description: 'Are you up to speed on cryptocurrency? Do you know your Bitcoin from your Etherium? Test yourself here!',
    rating: '4.3',
    plays: 78,
    banner: 'https://placehold.co/600x200/CDDC39/000000?text=Cryptocurrency+Quiz',
    languages: ['en'],
    tags: ['cryptocurrency', 'bitcoin', 'etherium', 'blockchain', 'NFT', 'Doge Coin'],
    user_id: 'user777',
    cards: [
      {
        question: 'Who created Bitcoin?',
        type: 'multiple-choice',
        answers: ['Satoshi Nakamoto', 'Changpeng Zhao', 'Vitalik Buterin', 'Elon Musk'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=bitcoin',
        correct_answer_index: 0,
      },
      {
        question: 'Which blockchain is Ether built on?',
        type: 'multiple-choice',
        answers: ['Avalanche', 'Solana', 'Etherium', 'Cardano'],
        picture: 'https://placehold.co/150x150/E0E0E0/000000?text=ether',
        correct_answer_index: 2,
      },
    ],
  },
]);

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
    return mockQuizCardViews
  }
  function returnIsoCards() {
    return isoCodes
  }
  function returnAllTags() {
    const allTagsArrays = mockQuizCardViews.value.map((card) => card.tags)
    const allTags: string[] = []

    for (const tags of allTagsArrays) {
      allTags.push(...tags)
    }

    return [...new Set(allTags)]
  }
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
