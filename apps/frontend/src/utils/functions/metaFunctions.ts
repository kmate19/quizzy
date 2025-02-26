import { clientv1 } from "@/lib/apiClient"

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
  