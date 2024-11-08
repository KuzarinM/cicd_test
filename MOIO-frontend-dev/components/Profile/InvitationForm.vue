<template>
  <div class="profile-invitation">
    <h1 class="profile-invitation__header">
      Пригласительный код
    </h1>
    <form class="profile-invitation__form" @submit.prevent="checkCode()">
      <div class="profile-invitation__input-group">
        <label for="invite-code" class="profile-invitation__label">
          Если другой пользователь пригласил вас в свой дом, то вам на почту было отправлено письмо с кодом подтверждения
        </label>
        <div class="profile-invitation__input-container">
          <input id="invite-code" v-model="code" placeholder="Код" type="text" class="profile-invitation__input" required>
        </div>
      </div>
      <ui-button type="submit" rounded="16px" padding="6px 12px">
        Подтвердить
      </ui-button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useGroupsStore } from "~/store/groups"

const code = ref('')
const groupStore = useGroupsStore()
async function checkCode () {
  if (code.value.length) {
    await groupStore.checkCode(code.value)
    await groupStore.getAll()
    await groupStore.getHouses()
  }
}
</script>

<style lang="scss">
@import "assets/styles/components/invitation-form";
</style>
