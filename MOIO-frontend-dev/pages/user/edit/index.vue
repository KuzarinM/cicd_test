<template>
  <div class="user-edit">
    <loader-screen :is-loading="isLoading" />
    <h1 class="user-edit__header">
      Смена {{ type === 'password' ? 'пароля' : "почты" }}
    </h1>
    <form method="post" class="user-edit__container" @submit.prevent="changeData()">
      <h2 class="user-edit__subheader">
        {{ type === 'password' ? 'Введите старый и новый пароль' : "Введите новую почту и пароль" }}
      </h2>
      <div v-if="type === 'password'" class="user-edit__input-group">
        <label for="password" class="user-edit__input-group-label">Введите новый пароль</label>
        <input
          id="password"
          v-model="newPassword"
          type="text"
          class="user-edit__input-group-input"
          required
        >
      </div>
      <div v-if="type === 'email'" class="user-edit__input-group">
        <label for="login" class="user-edit__input-group-label">Введите новую почту</label>
        <input
          id="login"
          v-model="login"
          type="email"
          class="user-edit__input-group-input"
          required
        >
      </div>
      <div class="user-edit__input-group">
        <label for="old-pass" class="user-edit__input-group-label">
          Введите {{ type === 'password' ? 'старый' : "" }} пароль
        </label>
        <input
          id="old-pass"
          v-model="oldPassword"
          type="text"
          class="user-edit__input-group-input"
          required
        >
      </div>
      <h2 v-if="step === 2" class="user-edit__subheader">
        Код подтверждения
      </h2>
      <div v-if="step === 2" class="user-edit__input-group">
        <label for="confirmation" class="user-edit__input-group-label">
          Введите код подтверждения. Вам было отправлено письмо с кодом подтверждения на новую почту
        </label>
        <input
          id="confirmation"
          v-model="code"
          type="text"
          class="user-edit__input-group-input"
          placeholder="Код подтверждения"
          required
        >
      </div>
      <ui-button
        type="submit"
        rounded="16px"
        padding="4px 12px"
        margin-inline="0"
      >
        Сохранить
      </ui-button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "~/store/user"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import apiUserConfirmLogin from "~/api/user/confirmLogin"
import apiUserConfirmPassword from "~/api/user/confirmPassword"

const userStore = useUserStore()
const router = useRoute()

const passwordFetch = useLazyAsyncData(
  'password',
  () => userStore.changePassword({ oldPassword: oldPassword.value, newPassword: newPassword.value }),
  { immediate: false },
)
const passwordConfirmFetch = useLazyAsyncData(
  'password-confirm',
  () => apiUserConfirmPassword(code.value),
  { immediate: false },
)
passwordFetch.pending.value = false
passwordConfirmFetch.pending.value = false

const loginFetch = useAsyncData(
  'login',
  async () => await userStore.changeLogin({ newLogin: login.value, password: oldPassword.value }),
  { immediate: false },
)
const loginConfirmFetch = useAsyncData(
  'login-confirm',
  async () => await apiUserConfirmLogin(code.value),
  { immediate: false },
)
loginFetch.pending.value = false
loginConfirmFetch.pending.value = false
const isLoading = computed(() => passwordFetch.pending.value ||
    passwordConfirmFetch.pending.value ||
    loginFetch.pending.value ||
    loginConfirmFetch.pending.value)

const type = ref<'password'|'email'>(router.query?.password ? 'password' : 'email')
const oldPassword = ref('')
const newPassword = ref('')
const login = ref('')
const code = ref('')
const step = ref(1)
function clearFields () {
  code.value = ''
  newPassword.value = ''
  code.value = ''
  oldPassword.value = ''
  login.value = ''
}

async function changeData () {
  if (step.value === 1) {
    if (type.value === "password") {
      await passwordFetch.execute()
      step.value = passwordFetch.data.value ? 2 : 1
      return
    }
    if (type.value === "email") {
      await loginFetch.execute()
      step.value = loginFetch.data.value ? 2 : 1
      return
    }
  }
  if (step.value === 2) {
    if (type.value === "password") {
      await passwordConfirmFetch.execute()
      console.log(passwordConfirmFetch.data)
      step.value = passwordConfirmFetch.data.value ? 1 : 2
      passwordConfirmFetch.data.value && clearFields()
    }
    if (type.value === "email") {
      await loginConfirmFetch.execute()
      console.log(loginConfirmFetch.data)

      step.value = loginConfirmFetch.data.value ? 1 : 2
      loginConfirmFetch.data.value && clearFields()
    }
  }
}
</script>

<style lang="scss">
@import "assets/styles/page/user-edit";
</style>
