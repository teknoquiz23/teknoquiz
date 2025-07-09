<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal-content">
      <h2>🎉 Well done! 🎉 </h2>
      <h3>Ready for another challenge?</h3>
      <button @click="nextRound">Play next round</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
export default defineComponent({
  name: 'SuccessModal',
  setup() {
    const visible = ref(true); // Show on page load for debugging
    function nextRound() {
      window.location.reload();
    }
    return { visible, nextRound };
  }
});
</script>

<style scoped>
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
}

h2 {
    margin-bottom: 10px;
}
h3 {
    margin-top: 0;
}

</style>
