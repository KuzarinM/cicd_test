<template>
  <div class="any-list-item">
    <slot name="title" />
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
export interface IUnknownProps{
  padding?:string
  bgColor?:string
  bRadius?:string
}
const props = withDefaults(defineProps<IUnknownProps>(), { padding: '16px 20px', bgColor: 'var(--settings-color)', bRadius: '16px' })

</script>

<style lang="scss">
.any-list-item{
  @include action-item;
  width: 100%;
  background: v-bind(bgColor);
  padding: v-bind(padding);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: v-bind(bRadius);
}
</style>
