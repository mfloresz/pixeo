<template>
    <div
        class="flex-shrink-0 bg-card/80 backdrop-blur-md rounded-xl border border-border shadow-md p-4 transition duration-200 ease-in-out flex items-center w-full max-w-4xl mx-auto justify-between flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-8"
    >
        <div class="flex items-center gap-2">
            <button
                v-if="canUndo"
                @click="undo"
                class="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                :title="$t('inpaint.undo')"
            >
                <Undo2 class="w-5 h-5" />
            </button>

            <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-muted-foreground">{{ $t('inpaint.brushSize') }}</span>
                <input
                    type="range"
                    :min="10"
                    :max="200"
                    v-model.number="brushSize"
                    class="w-32 accent-primary"
                />
                <span class="text-xs font-mono w-8">{{ brushSize }}</span>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <AlertDialog>
                <AlertDialogTrigger as-child>
                    <button
                        class="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center gap-2"
                        :title="$t('inpaint.clear')"
                    >
                        <Trash2 class="w-4 h-4" />
                        <span class="text-sm hidden sm:inline">{{ $t('inpaint.clearLabel') }}</span>
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{{ $t('inpaint.clearConfirmTitle') }}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {{ $t('inpaint.clearConfirmDescription') }}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{{ $t('inpaint.cancel') }}</AlertDialogCancel>
                        <AlertDialogAction @click="clear" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {{ $t('inpaint.clear') }}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <button
                @click="toggleOriginal"
                class="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                :class="showOriginal ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'"
                :title="$t('inpaint.original')"
            >
                <Eye class="w-4 h-4" />
                <span class="text-sm hidden sm:inline">{{ $t('inpaint.original') }}</span>
            </button>

            <button
                v-if="!showOriginal"
                @click="upscale"
                class="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex items-center gap-2"
                :title="$t('inpaint.upscale')"
            >
                <Maximize class="w-4 h-4" />
                <span class="text-sm hidden sm:inline">{{ $t('inpaint.upscale') }}</span>
            </button>

            <button
                @click="downloadCurrent"
                class="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
                :title="$t('inpaint.download')"
            >
                <Download class="w-4 h-4" />
                <span class="text-sm hidden sm:inline">{{ $t('inpaint.download') }}</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useInpaintStore } from '../../stores/inpaint';
import { Undo2, Eye, Download, Maximize, Trash2 } from 'lucide-vue-next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const inpaintStore = useInpaintStore();
const { canUndo, showOriginal, brushSize } = storeToRefs(inpaintStore);

function undo() {
    inpaintStore.undo();
}

function upscale() {
    inpaintStore.superResolution();
}

function toggleOriginal() {
    inpaintStore.showOriginal = !inpaintStore.showOriginal;
    if (!inpaintStore.showOriginal) {
        inpaintStore.separatorPosition = 0;
    }
}

function clear() {
    inpaintStore.clear();
}

function downloadCurrent() {
    inpaintStore.downloadCurrent();
}
</script>
