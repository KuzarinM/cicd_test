<template>
  <div ref="authInputParent" class="auth-input">
    <input
      v-model="model"
      class="auth-input__field"
      :name="name"
      :type="type??'text'"
      :autocomplete="autocomplete??' '"
      :placeholder="placeholder??' '"
      :required="Boolean(required)"
    >
    <label class="auth-input__label">{{ label }}</label>
  </div>
</template>

<script setup lang="ts">

export type FormInput = {
  label:string,
  name:string,
  value:string,
  type?:string,
  autocomplete?:string
  placeholder?:string
  required?:boolean
}

const props = defineProps<FormInput>()
const emit = defineEmits<{
    authInput:[string]
}>()
const authInputParent = ref(null)
const model = computed({
  get () {
    return props.value
  },
  set (value) {
    emit('authInput', value)
  },
})

</script>

<style lang="scss">
@import "assets/styles/components/_auth-input";
</style>
