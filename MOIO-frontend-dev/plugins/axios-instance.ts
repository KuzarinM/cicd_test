import axios from "axios"

export default defineNuxtPlugin({
  name: 'app:axios-instance',

  setup () {
    const axiosInstance = axios.create()
    const isAxiosInit = ref(false)
    const noRetry$ = ref(false)
    const basicHeaders = {
      accept: 'application/json-patch+json',
    }
    return {
      provide: {
        axiosPlugin: {
          axiosInstance,
          isAxiosInit,
          noRetry$,
          basicHeaders,
        },
      },
    }
  },
})
