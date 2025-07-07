<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{ message: string }>();
const visible = ref(false);
let timeoutId: number | undefined;

onMounted(() => {
  visible.value = true;
  timeoutId = window.setTimeout(() => {
    visible.value = false;
  }, 5000);
});

onBeforeUnmount(() => {
  if (timeoutId) clearTimeout(timeoutId);
});
</script>

<template>
  <div v-if="visible" class="hints-wrap visible">
    <p v-html="message"></p>
  </div>
</template>

<style scoped>
.hints-wrap {
  min-width: 300px;
  position: fixed;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #E5E4E2;
  color: #000;
  padding: 10px 20px;
  text-align: center;
  z-index: 1000;
  border-radius: 120px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.25);
  transition: top 0.4s cubic-bezier(0.4,0,0.2,1);
  animation: hint-slide-down-up 5s cubic-bezier(0.4,0,0.2,1) forwards;
}
@keyframes hint-slide-down-up {
  0% { top: -120px; }
  10% { top: 160px; }
  90% { top: 160px; }
  100% { top: -120px; }
}
</style>
