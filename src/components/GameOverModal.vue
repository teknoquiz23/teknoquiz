<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal-content">
      <h2>😔 You failed! 😔</h2>
      <h3>Better luck next time!</h3>
      <button @click="tryAgain">Try again</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
export default defineComponent({
  name: 'GameOverModal',
  setup() {
    const visible = ref(true); // Show on page load for debugging
    function tryAgain() {
      window.location.reload();
    }
    return { visible, tryAgain };
  }
});
</script>

<style scoped>
h2 {
    color: rgb(241, 73, 73)
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeInModal 0.5s ease forwards;
}
@keyframes fadeInModal {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal-content {
  min-width: 400px;
  background: #333;
  padding: 2rem 3rem;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.2);
  text-align: center;
}
button {
  margin-top: 1.5rem;
  border: none;
  background: #d9534f;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover {
  background: #9a3a37;
}
h2 {
    margin-bottom: 10px;
}
h3 {
    margin-top: 0;
}
</style>
