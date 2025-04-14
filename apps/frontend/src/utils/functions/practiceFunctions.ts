import { clientv1 } from '@/lib/apiClient'
import type { Game } from '@/utils/type'
import { arrayBufferToBase64 } from '../helpers';
import{ useQuizzyStore } from '@/stores/quizzyStore'

export const getGameQuiz = async (id: string) =>
{
 const quizzyStore = useQuizzyStore()
  let get;
  
  if (quizzyStore.isSelfQuiz) {
    get = await clientv1.quizzes.own[':quizId'].$get({ param: { quizId: id } })
  } else {
    get = await clientv1.quizzes[':quizId'].$get({ param: { quizId: id } })
  }

    if(get.status === 200)
    {
        const res = await get.json()
        const game : Game = {
            id: res.data.id,
            title: res.data.title,
            banner: arrayBufferToBase64(res.data.banner.data),
            description: res.data.description,
            cards: res.data.cards.map((q) => ({
                question: q.question,
                type: q.type,
                answers: q.answers,
                picture: arrayBufferToBase64(q.picture.data),
                correct_answer_index: q.correct_answer_index
            }))
        }
        return game
            
    }
}