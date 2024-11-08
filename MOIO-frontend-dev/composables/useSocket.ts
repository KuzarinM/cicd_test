import * as signalR from "@microsoft/signalr"
import { useUserStore } from "~/store/user"


export default async function useSocket (httpCtxUrl:string, autoReconnect = false) {
  const userStore = useUserStore()
  await userStore.init()
  const connection = new signalR.HubConnectionBuilder()
    .configureLogging(signalR.LogLevel.None)
    .withUrl(httpCtxUrl + '?uid=' + userStore.userInfo.id, { accessTokenFactory: () => userStore.accessToken })
    .build()
  async function start () {
    try {
      await connection.start()
      console.log("SignalR Connected.")
    } catch (err) {
      console.log(err)
      if (autoReconnect) {
        setTimeout(start, 5000)
      }
    }
  }
  start()

  connection.onclose(async () => {
    await start()
  })
  return {
    connection,
    start,
  }
}
