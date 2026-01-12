<template>
  <VueSonnerToaster
    :theme="theme"
    class="toaster group"
    :icons="icons"
    :style="toastStyles"
    position="top-right"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-vue-next';
import { Toaster as VueSonnerToaster, type ToasterProps } from 'vue-sonner';
import { useConfigStore } from '@/stores/config';

const configStore = useConfigStore();
const theme = computed(() => configStore.theme as ToasterProps['theme']);

const icons = {
  success: CircleCheckIcon,
  info: InfoIcon,
  warning: TriangleAlertIcon,
  error: OctagonXIcon,
  loading: Loader2Icon,
};

const toastStyles = {
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',
  '--border-radius': 'var(--radius)',
} as const;

</script>
