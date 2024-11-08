<template>
  <div class="auth">
    <loader-screen :is-loading="isLoading" />
    <h1 class="auth__header">
      Регистрация
    </h1>
    <form method="post" class="auth__form" @submit.prevent="register()">
      <auth-form-input
        v-if="step===1"
        :value="name"
        name="name"
        label="Имя"
        autocomplete="name"
        :required="true"
        @auth-input="(newVal)=>name=newVal"
      />
      <auth-form-input
        v-if="step===1"
        :value="email"
        name="email"
        label="Email"
        autocomplete="email"
        :required="true"
        @auth-input="(newVal)=>email=newVal"
      />
      <auth-form-input
        v-if="step===1"
        name="password"
        :value="password"
        label="Пароль"
        type="password"
        :required="true"
        @auth-input="(newVal)=>password=newVal"
      />
      <auth-form-input
        v-if="step===1"
        name="clientId"
        :value="clientId"
        label="ClientID"
        type="text"
        :required="false"
        @auth-input="(newVal)=>clientId=newVal"
      />
      <div v-if="step === 2" class="auth__verification-description">
        Введите код подтверждения. Вам было отправлено письмо с кодом подтверждения на почту
      </div>
      <auth-form-input
        v-if="step === 2"
        name="confirmationCode"
        :value="confirmationCode"
        label="Код подтверждения"
        type="text"
        :required="true"
        @auth-input="(newVal)=>confirmationCode=newVal"
      />
      <input type="submit" value="Регистрация" class="auth__form-submit">
      <NuxtLink to="/login" class="auth__form-submit --outline">
        Войти
      </NuxtLink>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "~/store/user"
import type { IRegisterUserProps } from "~/api/user/register"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"

definePageMeta({
  layout: 'auth',

})
const userStore = useUserStore()
const isLoading = ref(false)
const step = ref(1)

const name = ref('')
const email = ref('')
const password = ref('')
const clientId = ref('')
const confirmationCode = ref('')

async function register () {
  isLoading.value = true
  if (name.value.length >= 50) {
    useNotification('error', 'Имя не должно превышать 50 символов')
    return
  }
  const registrationData:IRegisterUserProps = {
    name: name.value,
    login: email.value,
    password: password.value,
  }
  if (clientId.value?.length > 0) {
    registrationData.clientId = clientId.value
  }
  if (confirmationCode.value?.length > 0) {
    registrationData.confirmationCode = confirmationCode.value
  }
  try {
    const refreshToken = await userStore.register(registrationData)
    isLoading.value = false
    // console.log(refreshToken)
    if (step.value === 1) {
      step.value = 2
      return
    }
    const config = useRuntimeConfig()
    const cookie = useCookie(config.public.REST_BASE_TOKEN_STORAGE_NAME, { maxAge: 30 * 60 * 60 * 90 })
    cookie.value = refreshToken
  } catch {
    isLoading.value = false
  }
}

</script>

<style lang="scss">
@import "assets/styles/page/auth";
</style>
