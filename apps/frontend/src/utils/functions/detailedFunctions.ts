import { clientv1 } from '@/lib/apiClient'
import { arrayBufferToBase64 } from '@/utils/helpers'
import type { Language } from '@/utils/type'
import { toast, type ToastContainerOptions } from 'vue3-toastify'
import { type detailedQuiz } from '@/utils/type'
import { useQuizzyStore } from '@/stores/quizzyStore'


export const getQuiz = async (uuid: string) => {
  const quizzyStore = useQuizzyStore()
  let quizResponse;
  
  if (quizzyStore.isSelfQuiz) {
    quizResponse = await clientv1.quizzes.own[':quizId'].$get({ param: { quizId: uuid.toString() } })
  } else {
    quizResponse = await clientv1.quizzes[':quizId'].$get({ param: { quizId: uuid.toString() } })
  }
  
  if (quizResponse.ok) {
    const res = await quizResponse.json()
    const getUser = await clientv1.userprofile[':userId'].$get({
      param: { userId: res.data.user_id },
    })
    let user = ''
    if (getUser.ok) {
      const userRes = await getUser.json()
      user = userRes.data.username
    }
    const tempData: detailedQuiz = {
      id: res.data.id,
      status: res.data.status,
      created_at: new Date(res.data.created_at).toISOString().split('T')[0],
      updated_at: new Date(res.data.updated_at).toISOString().split('T')[0],
      title: res.data.title,
      description: res.data.description,
      rating: res.data.rating,
      plays: res.data.plays,
      banner: arrayBufferToBase64(res.data.banner.data),
      languages: res.data.languages.map(
        (lang): Language => ({
          name: lang.language.name,
          iso_code: lang.language.iso_code,
          icon: lang.language.icon,
        }),
      ),
      tags: res.data.tags.map((tag) => tag.tag.name as unknown as string),
      user_id: res.data.user_id,
      username: user,
      cards: res.data.cards.map((card) => ({
        question: card.question,
        type: card.type,
        answers: card.answers,
        picture: arrayBufferToBase64(card.picture.data),
        correct_answer_index: card.correct_answer_index,
      })),
    }
    return {
      data: tempData,
      user: user,
    }
  } else {
    const res = await quizResponse.json()
    toast(res.message, {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    } as ToastContainerOptions)
  }
}

