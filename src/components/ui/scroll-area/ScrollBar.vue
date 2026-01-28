<template>
    <ScrollAreaScrollbar
        v-bind="props"
        :class="
            cn(
                'flex touch-none select-none transition-colors',
                orientation === 'vertical' &&
                    'h-full w-2.5 border-l border-l-transparent p-[1px]',
                orientation === 'horizontal' &&
                    'h-2.5 flex-col border-t border-t-transparent p-[1px]',
                props.class
            )
        "
    >
        <ScrollAreaThumb
            :class="
                cn(
                    'relative rounded-full bg-border',
                    orientation === 'vertical' && 'flex-1'
                )
            "
        />
    </ScrollAreaScrollbar>
</template>

<script setup lang="ts">
import {
    ScrollAreaScrollbar,
    ScrollAreaThumb,
} from 'reka-ui';
import { cn } from '../../../lib/utils';

const props = withDefaults(defineProps<{
    orientation?: 'vertical' | 'horizontal';
    class?: string;
}>(), {
    orientation: 'vertical',
});
</script>
