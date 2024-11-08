<template>
  <button
    :class="`ui-button --${className}  ${fill.length
      ?'--fill':''} ${rounded!==0?'--rounded':''} ${centered!==0?'--centred':''} ${padding!==0?'--padding':''}`"
    :type="type"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
export interface IUiButton{
  className?:'default'|'delete'|'delete-outline'|'blank'
  type?:'button'|'submit'|'reset'
  marginInline?:string
  fill?: string
  rounded?:string
  padding?:string
  centered?:boolean
  bgColor?:string
}
const props = withDefaults(defineProps<IUiButton>(), {
  className: 'default',
  type: 'button',
  marginInline: 'auto',
  fill: '',
  rounded: '0',
  padding: '8px 12px',
  centred: false,
  bgColor: '',
})
</script>

<style lang="scss">
.ui-button{
  @include button;
  display: block;
  margin-inline: v-bind(marginInline);
  padding: v-bind(padding);
  border: 0;
  border-radius: 15px;
  cursor: pointer;
  &:disabled{
    filter: grayscale(.8);
    cursor: not-allowed;
  }
  &:not(.--fill){
   background: $color-active;
  }
  &.--fill{
    background: v-bind(fill);
  }
  &.--rounded{
    border-radius: v-bind(rounded);
  }
  &.--centred {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &.--blank{
    display: flex;
    outline: none;
    margin-inline: 0;
    &:not(.--fill){
     background: transparent;
    }
    &:not(.--padding){
      padding: 0;
    }
    &:not(.--rounded){
      border-radius: 0;
    }
  }
  &.--default{
    color: $bg-primary;
    &:not(.--fill){
      background: $color-active;
    }
  }
  &.--delete{
    color: $bg-primary;
    background: #D15151
  }
  &.--delete-outline{
    color: #D15151;
    border: 2px solid #D15151;
    padding: 8px 24px;
    background: transparent;
    transition: background, color .2s;
    &:hover{
      background: #D15151;
      color: $color-primary;
    }
  }
}
</style>
