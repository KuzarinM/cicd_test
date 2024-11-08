export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig()
  const cookie = useCookie(config.public.REST_BASE_TOKEN_STORAGE_NAME)
  if (!cookie.value?.length && !to.path.match(/(login)|(register)/gm)) {
    // если кука пустая, редиректим на логин
    // return navigateTo('/login')
  }
})
