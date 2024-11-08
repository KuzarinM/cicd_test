export default function useNotification (type:'info'|'warning'|'error', message:string) {
  let iconName = ''
  switch (type) {
    case "info":
      iconName = 'notification/information'
      break
    case "error":
      iconName = 'notification/alert-octagon'
      break
    case "warning":
      iconName = 'notification/alert'
  }
  nextTick(() => {
    if (process.client) {
      useNuxtApp().$toast[type](message, {
        autoClose: 10 * 1000,
        position: 'top-center',
      })
    }
  })
}
