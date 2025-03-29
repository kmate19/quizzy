import { clientv1 } from "@/lib/apiClient"
import type { quizCardView } from "../type"
import { arrayBufferToBase64 } from "../helpers"

export const getQuizzes = async (limit: string | undefined, currentPage: string | undefined, 
  isStrict: string | undefined, tags: string | [string, ...string[]] | undefined, 
  languages: string | [string, ...string[]] | undefined, searchText: string | undefined) => {
  let response;
    if((Array.isArray(tags) && tags.length > 0) || (searchText && searchText !== "") || (Array.isArray(languages) && languages.length > 0)){
      response = await clientv1.quizzes.search.$get({query:{
        query: searchText !== undefined ? searchText : undefined,
        strict: isStrict !== undefined ? isStrict : undefined, 
        limit: limit !== undefined ? limit : undefined, 
        page: currentPage !== undefined ? currentPage : undefined, 
        tagNames: tags !== undefined ? tags : undefined,
        languageISOCodes: languages !== undefined ? languages : undefined,
      }})
    }
    else{
      response = await clientv1.quizzes.$get({
        query: { limit: limit?.toString(), page: currentPage?.toString() }
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