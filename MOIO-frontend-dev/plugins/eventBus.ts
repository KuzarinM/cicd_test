// Doc: https://github.com/developit/mitt
import mitt from 'mitt'

export type ApplicationEvents = {
  /**
   * 'object:event:modification' -> payload type
   * @example 'user:login': User (interface) or type [maybe void]
   */
  'app:layout:created': void
  'app:layout:mounted': void
}

export default defineNuxtPlugin(({ $config }) => {
  const emitter = mitt<ApplicationEvents>()

  if (!$config.public.APP_IS_PROD && $config.public.APP_DEBUG) {
    emitter.on('*', (type, e: unknown) => {
      if (e) {
        console.log('bus', `${type}`, e)
      } else {
        console.log('bus', `${type}`)
      }
    })
  }

  return {
    provide: {
      bus: {
        emit: emitter.emit,
        on: emitter.on,
        off: emitter.off,
      },
    },
  }
})
