<template>
    <ui-modal :is-shown="isModalOpen" transition-content-name="translate" backdrop-filter="blur(5px)" width="500px"
        @click-outside="emit('cancel')">
        <template #inner>
            <div class="delete-confirmation" role="dialog">
                <h2 class="delete-confirmation__header" v-if="$slots.heading">
                    <slot name="heading"></slot>
                </h2>
                <p class="delete-confirmation__body" v-if="$slots.description">
                    <slot name="description"></slot>
                </p>
                <div class="delete-confirmation__prompt">
                    <ui-button variant="secondary" class="delete-confirmation__prompt-item"
                        @click="emit('cancel')">
                        Отменить
                    </ui-button>
                    <ui-button variant="primary" class="delete-confirmation__prompt-item" @click="emit('delete')">
                        Удалить
                    </ui-button>
                </div>
            </div>
        </template>
    </ui-modal>
</template>

<script setup lang="ts">
const { isModalOpen } = defineProps<{ isModalOpen: boolean }>()
const emit = defineEmits<{ delete: [], cancel: [] }>()
</script>

<style lang="scss">
@import "assets/styles/components/delete-confirmation";
</style>
