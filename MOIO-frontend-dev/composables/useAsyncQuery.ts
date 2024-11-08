import { type AxiosError, type AxiosInstance } from 'axios'
import { consola } from 'consola'

import { useUserStore } from '~/store/user'
import useNotification from "~/composables/useNotification"
import useValidationBackendError from "~/composables/useValidationBackendError"


interface IArgs {
  axios: AxiosInstance
  path: string
}
export default async function (queryCallback = async ({ axios }: IArgs): Promise<any> => {}) {
  const nuxtApp = useNuxtApp()
  const config = nuxtApp.$config
  const {
    axiosInstance,
    isAxiosInit,
    noRetry$,
    basicHeaders,
  } = nuxtApp.$axiosPlugin

  function createAuthHeaders () {
    if (process.server) {
      return {}
    }
    const token = localStorage.getItem(config.public.REST_BASE_TOKEN_STORAGE_NAME as string) || ''
    if (token) {
      return {
        [config.public.REST_BASE_TOKEN as string]: `Bearer ${token}`,
      } as { Authorization: string }
    }
  }

  async function refreshAccessToken () {
    const userStore = useUserStore()
    return await userStore.refresh()
  }

  if (!isAxiosInit.value) {
    axiosInstance.interceptors.request.use(async (config) => {
      await nuxtApp.runWithContext(() => {
        config.headers = Object.assign({}, config.headers, basicHeaders, createAuthHeaders())
      })
      return config
    })

    axiosInstance.interceptors.response.use((response) => {
      return response
    }, async (error) => {
      const originalRequest = error.config
      if (error.response?.status === 401) {
        originalRequest._retry = true
        const accessToken = await refreshAccessToken()
        axiosInstance.defaults.headers.common[config.public.REST_BASE_TOKEN as string] = `Bearer ${accessToken}`
        return axiosInstance(originalRequest)
      }
      return Promise.reject(error)
    })

    isAxiosInit.value = true
  }

  try {
    const response = await queryCallback({ axios: axiosInstance, path: config.public.API_ENDPOINT as string })
    if (response && response?.status === 200) {
      config.public.APP_DEBUG && consola.box(`[useAsyncQuery] ${response.config.url}`, response)
      return response.data
    }
  } catch (err) {
    const e = err as AxiosError
    config.public.APP_DEBUG && consola.error('[useAsyncQuery]: Catch', e)
    config.public.APP_DEBUG && useNotification('error', `Произошла ошибка при обработке запроса ${e?.config?.url}`)
    useValidationBackendError(err)
  }
}
