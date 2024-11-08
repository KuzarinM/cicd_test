import { type CookieOptions, useCookie } from "#app"
import { nextTick } from "vue"

export default function useSetCookie (key:string, value:string, options?: CookieOptions) {
  const cookie = useCookie(key, { ...options, maxAge: 30 * 24 * 60 * 60 })
  const self = getCurrentInstance()
  self?.appContext.app.runWithContext(() => {
    cookie.value = value
  })
}
