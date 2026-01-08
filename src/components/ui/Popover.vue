<template>
  <div class="inline-block">
    <div ref="triggerRef" @click="toggleOpen">
      <slot name="trigger" />
    </div>

    <Teleport to="body">
      <Transition name="popover">
        <div
          v-if="open"
          ref="contentRef"
          class="fixed z-50 w-80 rounded-lg border bg-card p-4 shadow-xl"
          :style="positionStyle"
          @click.stop
        >
          <slot />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = withDefaults(defineProps<{ side?: 'top' | 'bottom' | 'left' | 'right' }>(), {
  side: 'bottom'
});

const emit = defineEmits<{ openChange: [open: boolean] }>();

const open = ref(false);
const triggerRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();
const positionStyle = ref<Record<string, string>>({});

function toggleOpen() {
  open.value = !open.value;
  emit('openChange', open.value);
  
  if (open.value) {
    nextTick(() => updatePosition());
  }
}

function updatePosition() {
  if (!triggerRef.value || !contentRef.value) return;
  
  const trigger = triggerRef.value.getBoundingClientRect();
  const content = contentRef.value.getBoundingClientRect();
  
  let top = 0;
  let left = 0;
  
  switch (props.side) {
    case 'top':
      top = trigger.top - content.height - 8;
      left = trigger.left + (trigger.width - content.width) / 2;
      break;
    case 'bottom':
      top = trigger.bottom + 8;
      left = trigger.left + (trigger.width - content.width) / 2;
      break;
    case 'left':
      top = trigger.top + (trigger.height - content.height) / 2;
      left = trigger.left - content.width - 8;
      break;
    case 'right':
      top = trigger.top + (trigger.height - content.height) / 2;
      left = trigger.right + 8;
      break;
  }
  
  positionStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  };
}

function handleClickOutside(e: MouseEvent) {
  if (open.value && triggerRef.value && contentRef.value) {
    const target = e.target as Node;
    if (!triggerRef.value.contains(target) && !contentRef.value.contains(target)) {
      open.value = false;
      emit('openChange', false);
    }
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.popover-enter-active,
.popover-leave-active {
  transition: all 0.2s ease-out;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.popover-enter-to,
.popover-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
