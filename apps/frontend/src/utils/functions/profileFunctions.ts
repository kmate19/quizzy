import { clientv1 } from '@/lib/apiClient'
import { arrayBufferToBase64 } from '../helpers'
import { toast } from 'vue3-toastify'
import { type Quiz, type userProfile } from '../type'
import { queryClient } from '@/lib/queryClient'
import * as zod from 'zod'
import router from '@/router'

export const userData = async (id: string) => {
  //await new Promise(resolve => setTimeout(resolve, 2000))
  if(id !== ""){
    const user = await clientv1.userprofile[':userId'].$get({param: {userId: id}})
    if (user.status === 200) {
      const res = await user.json()
      const userObj: userProfile = {
        username: res.data.username,
        created_at: new Date(res.data.created_at).toLocaleDateString(),
        activity_status: res.data.activity_status,
        profile_picture: res.data.profile_picture
        ? arrayBufferToBase64(res.data.profile_picture.data)
        : '',
        roles: res.data.roles,
        stats: res.data.stats,
      }
      
      return userObj
    } else {
      const res = await user.json()
      toast(res.error.message, {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      })
    }
  }
  else{
    const user = await clientv1.userprofile.$get()
    if (user.status === 200) {
      const res = await user.json()
      const userObj = {
        email: res.data.email,
        username: res.data.username,
        created_at: new Date(res.data.created_at).toLocaleDateString(),
        activity_status: res.data.activity_status,
        profile_picture: res.data.profile_picture
        ? arrayBufferToBase64(res.data.profile_picture.data)
        : '',
        sentFriendships: res.data.sentFriendships,
        recievedFriendships: res.data.recievedFriendships,
        roles: res.data.roles,
        stats: res.data.stats,
        friends: res.data.recievedFriendships
        .filter((item) => item.status === 'accepted')
        .map((item) => ({
          created_at: item.created_at,
          status: item.status,
          addressee: {
            id: item.requester.id,
            username: item.requester.username,
            activity_status: item.requester.activity_status,
            profile_picture: item.requester.profile_picture,
          },
        })),
      }
      
      return userObj
    } else {
      const res = await user.json()
      toast(res.error.message, {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      })
    }
  }
}

export const getOwnQuizzies = async () => {
  //await new Promise(resolve => setTimeout(resolve, 2000))
  try {
    const res = await clientv1.quizzes.own.$get()
    const data = await res.json()

    const quizzes: Quiz[] = data.data.map((el) => ({
      id: el.id,
      created_at: el.created_at,
      updated_at: el.updated_at,
      user_id: el.user_id,
      description: el.description,
      title: el.title,
      status: el.status,
      rating: el.rating,
      plays: el.plays,
      banner: arrayBufferToBase64(el.banner.data),
      languages: el.languages.map((lang) => ({
        name: lang.language.name,
        iso_code: lang.language.iso_code,
        icon: lang.language.icon,
        support: lang.language.support,
      })),
      tags: el.tags.map((tag) => ({
        name: tag.tag.name,
      })),
    }))
    return quizzes
  } catch (error) {
    console.error('error:', error)
  } finally {
  }
}

export const handleDelete = async (uuid: string) => {
  const del = await clientv1.quizzes.delete[':quizId'].$delete({ param: { quizId: uuid } })
  if (del.status === 200) {
    toast('Quiz sikeresen törölve', {
      autoClose: 3500,
      position: toast.POSITION.TOP_CENTER,
      type: 'success',
      transition: 'zoom',
      pauseOnHover: false,
    })
    queryClient.refetchQueries({ queryKey: ['userQuizzies'] })
  } else {
    const res = await del.json()
    toast(res.message, {
      autoClose: 3500,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    })
  }
}

const newPasswordSchema = zod.object({
  password: zod
    .string()
    .min(1, { message: 'A mező kitöltése kötelező' })
    .min(8, { message: 'Minimum 8 karaktert kell tartalmaznia az új jelszónak' })
    .regex(/[a-z]/, { message: 'Tartalmaznia kell kisbetűt az új jelszónak' })
    .regex(/[A-Z]/, { message: 'Tartalmaznia kell nagybetűt az új jelszónak' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Tartalmaznia kell speciális karaktert az új jelszónak' })
    .regex(/\d/, { message: 'Tartalmaznia kell számot az új jelszónak' }),
})

type NewPasswordSchemaType = zod.infer<typeof newPasswordSchema>

export const handlePasswordChange = async (
  userPw: string,
  userPwConfirmation: string,
  userCurrentPw: string,
) => {
  let regErrors = <zod.ZodFormattedError<NewPasswordSchemaType> | null>null
  const result = newPasswordSchema.safeParse({ password: userPw })
  if (!result.success) {
    regErrors = result.error.format()
    toast(Object.values(regErrors.password?._errors || [])[0] || 'Érvénytelen jelszó formátum!', {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    })
    return
  }
  if (userPwConfirmation !== userPw) {
    toast('A jelszavak nem egyeznek', {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    })
    return
  } else {
    const reset = await clientv1.auth.changepassword.$post({
      json: { oldPassword: userCurrentPw, password: userPw },
    })
    if (reset.status === 200) {
      toast('Jelszó sikeresen megváltoztatva!', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'success',
        transition: 'zoom',
        pauseOnHover: false,
      })
      await clientv1.auth.logout.$get()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/login')
    } else {
      const res = await reset.json()
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

export const getApiKey = async (expiration: string, description: string) => {
  const post = await clientv1.apikey.create.$post({
    json: { description: description, expires_at: new Date(expiration).toISOString() },
  })
  if (post.status === 200) {
    const res = await post.json()
    toast('Sikeres API kulcs generálás, mentse el mert többet nem tudja majd elérni!', {
      autoClose: 3500,
      position: toast.POSITION.TOP_CENTER,
      type: 'success',
      transition: 'zoom',
      pauseOnHover: false,
    })
    queryClient.refetchQueries({ queryKey: ['apiKeys'] })
    return res.data
  } else {
    const res = await post.json()
    toast(res.error.message, {
      autoClose: 3500,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    })
  }
}

export const deleteApiKey = async (uuid: number) => {
  const del = await clientv1.apikey.delete[':id'].$delete({ param: { id: uuid.toString() } })
  if (del.status === 200) {
    toast('API kulcs sikeresen törölve', {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'success',
      transition: 'zoom',
      pauseOnHover: false,
    })
    queryClient.refetchQueries({ queryKey: ['apiKeys'] })
  } else {
    const res = await del.json()
    console.log(res)
    toast(res.error.message, {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    })
  }
}

export const listApiKeys = async () => {
  const get = await clientv1.apikey.list.$get()
  if (get.status === 200) {
    const res = await get.json()
    console.log(res.data)
    return res.data.sort(
      (a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime(),
    )
  }
}
