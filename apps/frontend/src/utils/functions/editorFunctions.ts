import { arrayBufferToBase64 } from '../helpers'
import { clientv1 } from '@/lib/apiClient'
import { toast } from 'vue3-toastify'
import { nextTick } from 'vue'
import type { quizUpload } from '../type'
import { queryClient } from '@/lib/queryClient'

export const getQuiz = async (uuid: string) => {
  console.log('belso:', uuid)
  if (uuid === '') {
    return
  }
  const get = await clientv1.quizzes.own[':quizId'].$get({ param: { quizId: uuid.toString() } })
  if (get.status === 200) {
    const res = (await get.json()).data
    console.log(res)
    console.log(arrayBufferToBase64(res.banner.data))
    console.log('cards[0].picture.data', res.cards[0].picture.data)
    const quiz = {
      title: res.title,
      description: res.description,
      status: res.status,
      banner: arrayBufferToBase64(res.banner.data),
      languageISOCodes: res.languages.map((l) => l.language.iso_code),
      tags: res.tags.map((t) => t.tag.name),
      cards: await Promise.all(
        res.cards.map(async (c) => {
          return {
            question: c.question,
            type: c.type,
            answers: c.answers,
            picture: arrayBufferToBase64(c.picture.data),
            correct_answer_index: c.correct_answer_index,
          }
        }),
      ),
    }
    return {
      data: quiz,
      success: true,
      languages: res.languages.map((l) => ({
        name: l.language.name,
        iso_code: l.language.iso_code,
        icon: l.language.icon,
        support: l.language.support,
      })),
    }
  } else {
    console.log('request failed: ', get.status)
  }
}

export const handleQuizyUpload = async (quiz: quizUpload, isEdit: boolean, uuid: string) => {
  await nextTick()
  console.log(quiz)
  if (isEdit) {
    const edit = await clientv1.quizzes.edit[':quizId'].$patch({
      param: { quizId: uuid },
      /*json: {
        quiz: {
          title: quiz.title,
          description: quiz.description,
          status: quiz.status,
          banner: quiz.banner,
        },
        cards: quiz.cards,
        //tags: quiz.tags,
        //languageISOCodes: quiz.languageISOCodes,
      },*/
    })
    if (edit.status === 200) {
      toast('Quiz sikeresen módosítva!', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'success',
        transition: 'zoom',
        pauseOnHover: false,
      })
      queryClient.invalidateQueries({ queryKey: ['userQuizzies'], refetchType: 'none' })
      return true
    } else {
      const res = await edit.json()
      toast(res.message, {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      })
    }
  } else {
    const query = await clientv1.quizzes.publish.$post({
      json: {
        quiz: {
          title: quiz.title,
          description: quiz.description,
          status: quiz.status,
          banner: quiz.banner,
        },
        cards: quiz.cards,
        tags: quiz.tags,
        languageISOCodes: quiz.languageISOCodes,
      },
    })
    if (query.status === 201) {
      toast('Sikeres quiz feltöltés!', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'success',
        transition: 'zoom',
        pauseOnHover: false,
      })
      queryClient.invalidateQueries({ queryKey: ['userQuizzies'], refetchType: 'none' })
      return true
    } else {
      const res = await query.json()
      toast(res.message, {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      })
    }
  }
}

export const getTags = async () => {
  const get = await clientv1.meta.tags.$get()
  if (get.status === 200) {
    const res = await get.json()
    return res.map((t) => ({ name: t.name }))
  } else {
    const res = await get.json()
    console.log(res)
  }
}

export const getLanguages = async () => {
  const get = await clientv1.meta.languages.$get()
  if (get.status === 200) {
    const res = await get.json()
    return res.map((l) => ({ name: l.name, icon: l.icon, support: l.support, iso_code: l.isoCode }))
  } else {
    const res = await get.json()
    console.log(res)
  }
}
