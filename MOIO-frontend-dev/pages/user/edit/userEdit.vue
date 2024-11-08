<template>
  <div class="user-edit">
    <loader-screen :is-loading="isLoading" />
    <form method="post" class="user-edit__container" @submit.prevent="changeData()">
      <div v-if="type === 'email'" class="user-edit__input-group">
        <label for="login" class="user-edit__input-group-label">Новая почта</label>
        <input
          id="login"
          v-model="login"
          placeholder="Введите почту"
          type="email"
          class="user-edit__input-group-input"
          required
        >
      </div>
      <div class="user-edit__input-group">
        <label for="old-pass" class="user-edit__input-group-label">
          {{ type === 'password' ? 'Старый пароль' : "Пароль" }}
        </label>
        <input
          id="old-pass"
          v-model="oldPassword"
          placeholder="Введите пароль"
          type="password"
          class="user-edit__input-group-input"
          required
        >
        <div v-if="type === 'password'" class="user-edit__input-group">
          <label for="password" class="user-edit__input-group-label">Новый пароль</label>
          <input
            id="password"
            v-model="newPassword"
            placeholder="Введите новый пароль"
            type="password"
            class="user-edit__input-group-input"
            required
          >
        </div>
        <div v-if="type === 'password'" class="user-edit__input-group">
          <label for="password" class="user-edit__input-group-label">Подтвердите пароль</label>
          <input
            id="password"
            v-model="newPassword1"
            type="password"
            class="user-edit__input-group-input"
            placeholder="Подтвердите новый пароль"
            required
          >
        </div>
      </div>
      <h2 v-if="step === 2" class="user-edit__subheader">
        Код подтверждения
      </h2>
      <div v-if="step === 2" class="user-edit__input-group">
        <label for="confirmation" class="user-edit__input-group-label">
          Введите код подтверждения. Вам было отправлено письмо с кодом подтверждения на {{ type==='email' ? 'новую' : '' }} почту
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
        variant="secondary"
        type="submit"
        class="user-edit__button"
      >
        Сохранить изменения
      </ui-button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "~/store/user"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import apiUserConfirmLogin from "~/api/user/confirmLogin"
import apiUserConfirmPassword from "~/api/user/confirmPassword"

export type UserEdit = {
  type: string
}

const props = defineProps<UserEdit>()
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

const type = props.type === 'password' ? 'password' : 'email'
const oldPassword = ref('')
const newPassword = ref('')
const newPassword1 = ref('')
const login = ref('')
const code = ref('')
const step = ref(1)
function clearFields () {
  code.value = ''
  newPassword.value = ''
  newPassword1.value = ''
  code.value = ''
  oldPassword.value = ''
  login.value = ''
}

async function changeData () {
  if (step.value === 1) {
    if (type === "password") {
      if (newPassword.value != newPassword1.value) {
        useNotification('error', 'Пароли не совпадают')
      } else {
        await passwordFetch.execute()
        step.value = passwordFetch.data.value ? 2 : 1
        return
      }
    }
    if (type === "email") {
      await loginFetch.execute()
      step.value = loginFetch.data.value ? 2 : 1
      return
    }
  }
  if (step.value === 2) {
    if (type === "password") {
      await passwordConfirmFetch.execute()
      step.value = passwordConfirmFetch.data.value ? 1 : 2
      passwordConfirmFetch.data.value && clearFields()
    }
    if (type === "email") {
      await loginConfirmFetch.execute()
      step.value = loginConfirmFetch.data.value ? 1 : 2
      loginConfirmFetch.data.value && clearFields()
    }
  }
}
</script>

<style lang="scss">
@import "assets/styles/page/user-edit";
</style>
