<template>
    <ScrollAreaRoot
        :class="cn('relative overflow-hidden', props.class)"
    >
        <ScrollAreaViewport class="h-full w-full rounded-[inherit]">
            <slot />
        </ScrollAreaViewport>
        <ScrollBar />
        <ScrollAreaCorner />
    </ScrollAreaRoot>
</template>

<script setup lang="ts">
import { ScrollAreaRoot, ScrollAreaViewport, ScrollAreaCorner } from 'reka-ui';
import { cn } from '../../../lib/utils';
import ScrollBar from './ScrollBar.vue';

const props = defineProps<{
    class?: string;
}>();
</script>
