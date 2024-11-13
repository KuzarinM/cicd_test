<template>
  <button class="ui-button" :class="`ui-button--${variant}`" :disabled="disabled" :type="type">
    <slot />
  </button>
</template>

<script setup lang="ts">
export interface IUiButton {
  variant?: 'blank' | 'primary' | 'secondary' | 'icon'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}
const props = withDefaults(defineProps<IUiButton>(), {
  variant: 'blank',
  type: 'button',
  disabled: false,
})
</script>

<style lang="scss">
.ui-button {
  @include button;
  display: block;
  border: 0;
  border-radius: 12px;
  padding: 12px 0;
  align-items: center;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.25s;
  width: 100%;

  &:disabled {
    cursor: not-allowed;
    background-color: $color-bg-hover;
    color: $color-translucent;
  }

  &--primary {
    background-color: $color-active;
    color: #fff;

    &:hover {
      background-color: $color-active-hover;
    }
  }

  &--secondary {
    background-color: $color-bg-secondary;

    &:hover {
      background-color: $color-bg-secondary-hover;
    }
  }

  &--blank {
    width: fit-content;
    outline: none;
    margin-inline: 0;
    background: transparent;
    padding: 0;
    border-radius: 0;
  }
}
</style>
