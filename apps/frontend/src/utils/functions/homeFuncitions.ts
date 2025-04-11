import { clientv1 } from "@/lib/apiClient"
import type { quizCardView, QuizQueryParams } from "../type"
import { arrayBufferToBase64 } from "../helpers"

export const getQuizzes = async (params: QuizQueryParams) => {
  let response;
    if((Array.isArray(params.tags) && params.tags.length > 0) || (params.searchText && params.searchText !== "") || (Array.isArray(params.languages) && params.languages.length > 0)){
      response = await clientv1.quizzes.search.$get({query:{
        query: params.searchText !== undefined ? params.searchText : undefined,
        strict: params.strict !== undefined ? params.strict : undefined, 
        limit: params.limit !== undefined ? params.limit.toString() : undefined, 
        page: params.page !== undefined ? params.page : undefined, 
        tagNames: params.tags !== undefined ? params.tags : undefined,
        languageISOCodes: params.languages !== undefined ? params.languages : undefined,
      }})
    }
    else{
      response = await clientv1.quizzes.$get({
        query: { limit: params.limit?.toString(), page: params.page?.toString() }
      })
    }
    if (!response.ok) {
      throw new Error('Failed to fetch quizzes')
    }
    const data = await response.json()

    const quizArray: quizCardView[] = []
    data.data.quizzes.forEach((quiz) => {
        quizArray.push({
          id: quiz.id,
          created_at: new Date(quiz.created_at).toISOString().split('T')[0] ,
          updated_at: new Date(quiz.updated_at).toISOString().split('T')[0] ,
          title: quiz.title,
          description: quiz.description,
          rating: quiz.rating,
          plays: quiz.plays,
          banner: arrayBufferToBase64(quiz.banner.data),
          languages: quiz.languages.map((l) => ({
            icon: l.language.icon,
            iso_code: l.language.iso_code,
            name: l.language.name,
            support: l.language.support,
          })),
          tags: quiz.tags.map((tag) => ({
            name: tag.tag.name,
          })),
          user_id: quiz.user_id,
        });
      });
    return {
      quizzes: quizArray,
      totalPages: data.data.totalCount
    }
  }