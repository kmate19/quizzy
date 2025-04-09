import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import type { quizCardView } from '@/utils/type'
import QuizCard from '@/components/QuizCard.vue'
import NavBar from '@/components/NavBar.vue'
import MistBackground from '@/components/MistBackground.vue'
import CategoriesBtn from '@/components/CategoriesBtn.vue'
import { ref } from 'vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    {
      path: '/quiz/:id',
      name: 'detailed_view',
      component: { template: '<div>Detailed View</div>' },
    },
    {
      path: '/game_creation',
      name: 'game_creation',
      component: { template: '<div>Game Creation</div>' },
    },
    { path: '/profil', name: 'profile', component: { template: '<div>Profile</div>' } },
  ],
})

interface Tag {
  name: string
}

interface Language {
  iso_code: string
  name: string
  icon: string
}

const mockQuiz: quizCardView = {
  id: '123',
  user_id: '123dasd-123',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  title: 'Test Quiz',
  description: 'This is a test quiz',
  banner: 'test-banner.jpg',
  rating: 4.5,
  plays: 100,
  languages: [{ iso_code: 'en', name: 'English', icon: '🇺🇸' }],
  tags: [{ name: 'History' }, { name: 'Science' }],
}

interface WSClientResponse {
  status: number
  json: () => Promise<{ code: string }>
}

const mockGameView = { template: '<div>Host View Component</div>' }
const mockParticipantView = { template: '<div>Participant View Component</div>' }

const isHostValue = ref(true)
vi.mock('@/stores/quizzyStore', () => ({
  useQuizzyStore: () => ({
    get isHost() {
      return isHostValue
    },
  }),
}))

vi.mock('@/views/game/GameView.vue', () => ({
  default: mockGameView,
}))

vi.mock('@/views/game/ParticipantGame.vue', () => ({
  default: mockParticipantView,
}))

vi.mock('@/lib/apiClient', () => ({
  wsclient: {
    reserve: {
      session: {
        ':code?': {
          $post: vi.fn().mockResolvedValue({
            status: 200,
            json: () => Promise.resolve({ code: 'ABC123' }),
          } as WSClientResponse),
        },
      },
    },
  },
}))

interface QueryResult<T> {
  data: {
    value: T[]
  }
}

vi.mock('@tanstack/vue-query', () => ({
  useQuery: <T>({ queryKey }: { queryKey: string[] }): QueryResult<T> => {
    if (queryKey[0] === 'tags') {
      return {
        data: { value: [{ name: 'History' }, { name: 'Science' }] as Tag[] },
      } as QueryResult<T>
    }
    if (queryKey[0] === 'languages') {
      return {
        data: { value: [{ iso_code: 'en', name: 'English', icon: '🇺🇸' }] as Language[] },
      } as QueryResult<T>
    }
    return { data: { value: [] } } as QueryResult<T>
  },
  QueryClient: vi.fn().mockImplementation(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
  })),
}))

describe('QuizCard', () => {
  it('renders properly with props', () => {
    const wrapper = mount(QuizCard, {
      props: { quiz: mockQuiz },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('Test Quiz')
    expect(wrapper.text()).toContain('This is a test quiz')
    expect(wrapper.text()).toContain('4.5')
    expect(wrapper.text()).toContain('100')
    expect(wrapper.find('.bg-blue-500').exists()).toBe(true)
    expect(wrapper.find('.bg-gray-600').exists()).toBe(true)
  })

  it('navigates to detail view on click', async () => {
    const push = vi.spyOn(router, 'push')
    const wrapper = mount(QuizCard, {
      props: { quiz: mockQuiz },
      global: { plugins: [router] },
    })

    await wrapper.find('.quiz-card').trigger('click')
    expect(push).toHaveBeenCalledWith('/quiz/123')
  })

  it('uses placeholder image when banner is not provided', () => {
    const quizWithoutBanner: quizCardView = { ...mockQuiz, banner: '' }
    const wrapper = mount(QuizCard, {
      props: { quiz: quizWithoutBanner },
      global: { plugins: [router] },
    })

    const img = wrapper.find('v-img')
    expect(img.attributes('src')).toContain('/placeholder.svg')
  })
})

describe('NavBar', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.spyOn(router, 'push').mockClear()
  })

  it('renders navigation links correctly', () => {
    const wrapper = mount(NavBar, {
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('Kezdőlap')
    expect(wrapper.text()).toContain('Közös játék')
    expect(wrapper.text()).toContain('Játék készítés')
    expect(wrapper.text()).toContain('Profil')
  })

  it('toggles mobile menu', async () => {
    const wrapper = mount(NavBar, {
      global: { plugins: [router] },
    })

    expect(wrapper.find('.mobile-navbar > div').exists()).toBe(false)

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.mobile-navbar > div').exists()).toBe(true)

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.mobile-navbar > div').exists()).toBe(false)
  })

  it('opens and closes lobby code modal', async () => {
    const wrapper = mount(NavBar, {
      global: { plugins: [router] },
    })

    await wrapper
      .findAll('a')
      .filter((node) => node.text().includes('Közös játék'))[0]
      .trigger('click')
    expect(wrapper.find('h3').text()).toContain('Adja meg a kapott kódot')

    await wrapper.findComponent({ name: 'XButton' }).trigger('click')
    await flushPromises()
    expect(wrapper.find('h3').exists()).toBe(false)
  })

  it('shows error message for empty lobby code', async () => {
    const wrapper = mount(NavBar, {
      global: { plugins: [router] },
    })

    await wrapper
      .findAll('a')
      .filter((node) => node.text().includes('Közös játék'))[0]
      .trigger('click')

    await wrapper.find('button.glass-button').trigger('click')

    expect(wrapper.text()).toContain('Kérjük, adjon meg érvényes lobby kódot')
  })
})

describe('MistBackground', () => {
  it('renders with proper structure', () => {
    const wrapper = mount(MistBackground)

    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(wrapper.find('.mist-content-wrapper').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mount(MistBackground, {
      slots: {
        default: '<div class="test-slot">Test Content</div>',
      },
    })

    expect(wrapper.find('.test-slot').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Content')
  })
})

describe('CategoriesBtn', () => {
  it('renders button correctly', () => {
    const wrapper = mount(CategoriesBtn)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('opens modal on button click', async () => {
    const wrapper = mount(CategoriesBtn)
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.fixed').exists()).toBe(true)
    expect(wrapper.text()).toContain('Kategóriák')
  })

  it('filters categories based on search query', async () => {
    const wrapper = mount(CategoriesBtn)
    await wrapper.find('button').trigger('click')

    const searchInput = wrapper.find('input[type="text"]')
    await searchInput.setValue('history')

    const categoryElements = wrapper.findAll('.flex-1')
    expect(categoryElements.length).toBe(1)
    expect(categoryElements[0].text()).toContain('History')
  })

  it('toggles category selection', async () => {
    const wrapper = mount(CategoriesBtn)
    await wrapper.find('button').trigger('click')

    await wrapper.findAll('#tag')[0].trigger('click')

    expect(wrapper.find('.selected-categories').html()).toContain('div')
  })

  it('emits save event', async () => {
    const wrapper = mount(CategoriesBtn)
    await wrapper.find('button').trigger('click')

    await wrapper.findAll('#tag')[0].trigger('click')

    await wrapper.findAll('#lang')[0].trigger('click')

    await wrapper.find('button.glass-button').trigger('click')

    expect(wrapper.emitted().save.length).toBe(1)
    expect((wrapper.emitted().save[0] as any)[0]).toBeDefined()
    expect((wrapper.emitted().save[0] as any[])[0] as unknown as FilterPayload).toEqual({
      tags: ['History'],
      strictSearch: true,
      languages: ['en'],
    })
  })

  it('clears selected categories', async () => {
    const wrapper = mount(CategoriesBtn)
    await wrapper.find('button').trigger('click')

    await wrapper.findAll('#tag')[0].trigger('click')

    expect(wrapper.find('.selected-categories').html()).toContain('div')

    await wrapper.findAll('button')[2].trigger('click')

    expect(wrapper.find('.selected-categories').text()).toContain('Nincs kiválasztott kategória')
  })
})
