<script setup>
defineProps({
  palette: { type: Object, required: true },
  index: { type: Number, default: 0 },
  opened: { type: Boolean, default: false },
});
defineEmits(["pick"]);
</script>

<template>
  <button
    type="button"
    class="mini"
    :class="{ opened }"
    :style="{ '--c1': palette.c1, '--c2': palette.c2, '--c3': palette.c3 }"
    :aria-label="`Monthsary ${index + 1}`"
    @click="$emit('pick')"
  >
    <svg viewBox="0 0 40 64" width="34" height="54" aria-hidden="true">
      <path
        d="M20 34 V62"
        stroke="#3fae6b"
        stroke-width="2.6"
        stroke-linecap="round"
        fill="none"
      />
      <path d="M20 58 C10 56 8 46 10 40 C16 44 19 50 20 58Z" fill="#2f9a5b" />
      <path d="M20 34 C8 32 6 16 9 8 C14 12 18 18 20 34Z" class="side" />
      <path d="M20 34 C32 32 34 16 31 8 C26 12 22 18 20 34Z" class="side" />
      <path d="M20 34 C12 30 13 14 20 5 C27 14 28 30 20 34Z" class="mid" />
    </svg>
    <span class="num">{{ index + 1 }}</span>
  </button>
</template>

<style scoped>
.mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
.mini:hover,
.mini:active {
  transform: translateY(-3px) scale(1.08);
  background: rgba(255, 255, 255, 0.14);
}
.mini.opened {
  background: rgba(255, 255, 255, 0.12);
}
.side {
  fill: var(--c3);
}
.mid {
  fill: var(--c2);
}
.num {
  font-size: 10px;
  line-height: 1;
}
</style>
