<template>
    <div
        :class="[
            'shrink-0 bg-border',
            orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'
        ]"
        :data-orientation="orientation"
    />
</template>

<script setup lang="ts">
interface Props {
    orientation?: 'horizontal' | 'vertical';
}

withDefaults(defineProps<Props>(), {
    orientation: 'horizontal'
});
</script>
