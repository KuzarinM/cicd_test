<template>
  <div class="profile-settings">
    <h1 class="profile-roommates-section__header">
      Настройки
    </h1>
    <div class="profile-settings__list">
      <div class="profile-settings__item">
        <div class="profile-settings__item-ico">
          <span class="mdi mdi-leak" />
        </div>
        <div class="profile-settings__item-name">
          Датчики
        </div>
        <div class="profile-settings__item-chevron">
          <span class="mdi mdi-chevron-right" />
        </div>
      </div>
      <div class="profile-settings__item">
        <div class="profile-settings__item-ico">
          <span class="mdi mdi-door" />
        </div>
        <div class="profile-settings__item-name">
          Двери
        </div>
        <div class="profile-settings__item-chevron">
          <ui-icon name="chevron-right" />
        </div>
      </div>
      <div class="profile-settings__item">
        <div class="profile-settings__item-ico">
          <span class="mdi mdi-arrow-decision" />
        </div>
        <div class="profile-settings__item-name">
          Домашние центры и мосты
        </div>
        <div class="profile-settings__item-chevron">
          <span class="mdi mdi-chevron-right" />
        </div>
      </div>
      <div class="profile-settings__item">
        <div class="profile-settings__item-ico">
          <span class="mdi mdi-blinds-horizontal" />
        </div>
        <div class="profile-settings__item-name">
          Жалюзи и окна
        </div>
        <div class="profile-settings__item-chevron">
          <span class="mdi mdi-chevron-right" />
        </div>
      </div>
      <div class="profile-settings__item">
        <div class="profile-settings__item-ico">
          <span class="mdi mdi-lock" />
        </div>
        <div class="profile-settings__item-name">
          Замки
        </div>
        <div class="profile-settings__item-chevron">
          <span class="mdi mdi-chevron-right" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import UiIcon from "~/components/ui/UiIcon.vue"
</script>

<style lang="scss">
@import "assets/styles/components/profile-settings";
</style>
