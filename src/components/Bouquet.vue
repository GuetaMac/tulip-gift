<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import Tulip from "./Tulip.vue";

const props = defineProps({
  start: { type: Number, required: true }, // unang month index (0-based)
  palettes: { type: Array, required: true },
  opened: { type: Object, required: true }, // Set ng nabuksang tulips
  freshIndex: { type: Number, default: -1 },
});
const emit = defineEmits(["pick"]);

// [x, taas] ng gitna ng bawat bulaklak mula sa pinagtalian ng mga tangkay.
// Unang 7 = likod na hanay (pa-dome), huling 5 = harap na hanay.
const SPOTS = [
  [-135, 175],
  [-90, 205],
  [-45, 225],
  [0, 235],
  [45, 225],
  [90, 205],
  [135, 175],
  [-95, 140],
  [-48, 168],
  [0, 180],
  [48, 168],
  [95, 140],
];
const REF_DIST = 215;

const items = computed(() =>
  SPOTS.map(([x, h], k) => ({
    i: props.start + k,
    angle: (Math.atan2(x, h) * 180) / Math.PI,
    scale: Math.hypot(x, h) / REF_DIST,
  })),
);

// liliit nang kaunti sa maliliit na phone para kasya ang buong bouquet
const vw = ref(typeof window !== "undefined" ? window.innerWidth : 400);
const onResize = () => (vw.value = window.innerWidth);
onMounted(() => window.addEventListener("resize", onResize));
onUnmounted(() => window.removeEventListener("resize", onResize));
const f = computed(() => Math.min(1, (vw.value - 24) / 400));
</script>

<template>
  <div class="bouquet-outer" :style="{ height: 330 * f + 'px' }">
    <div class="bouquet" :style="{ transform: `scale(${f})` }">
      <div
        v-for="it in items"
        :key="it.i"
        class="item"
        :style="{ transform: `rotate(${it.angle}deg) scale(${it.scale})` }"
      >
        <Tulip
          :index="it.i"
          :palette="palettes[it.i % palettes.length]"
          :opened="opened.has(it.i)"
          :fresh="it.i === freshIndex"
          @pick="emit('pick', it.i)"
        />
      </div>

      <!-- balot at ribbon -->
      <div class="wrap"></div>
      <div class="ribbon"></div>
      <div class="bow">
        <i class="t t1"></i>
        <i class="t t2"></i>
        <i class="l"></i>
        <i class="r"></i>
        <i class="k"></i>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bouquet-outer {
  position: relative;
  width: 100%;
}
.bouquet {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 400px;
  height: 330px;
  margin-left: -200px;
  transform-origin: 50% 100%;
}

/* ang pinagtalian ng mga tangkay ay nasa ilalim ng bawat .item */
.item {
  position: absolute;
  left: 50%;
  bottom: 12px;
  width: 130px;
  height: 270px;
  margin-left: -65px;
  transform-origin: 50% 100%;
  pointer-events: none;
}
/* talulot lang ang pwedeng i-tap para hindi magkaharangan ang mga bulaklak */
.item :deep(.tulip) {
  pointer-events: none;
}
.item :deep(.petal) {
  pointer-events: auto;
  cursor: pointer;
}

.wrap {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 180px;
  height: 135px;
  margin-left: -90px;
  z-index: 5;
  background:
    linear-gradient(100deg, rgba(255, 255, 255, 0.35) 0 28%, transparent 28%),
    linear-gradient(165deg, #fff4f8 0%, #f9c6d9 55%, #ef9cbc 100%);
  clip-path: polygon(0 0, 100% 0, 64% 100%, 36% 100%);
}
.ribbon {
  position: absolute;
  left: 50%;
  bottom: 34px;
  width: 76px;
  height: 14px;
  margin-left: -38px;
  z-index: 6;
  border-radius: 4px;
  background: linear-gradient(#ff4d8d, #d6246e);
}
.bow {
  position: absolute;
  left: 50%;
  bottom: 38px;
  width: 0;
  height: 0;
  z-index: 7;
}
.bow i {
  position: absolute;
  display: block;
  background: linear-gradient(#ff5c9d, #c2185b);
}
.bow .t {
  width: 7px;
  height: 28px;
  top: 2px;
  border-radius: 2px;
}
.bow .t1 {
  left: -9px;
  transform: rotate(14deg);
}
.bow .t2 {
  left: 2px;
  transform: rotate(-14deg);
}
.bow .l {
  width: 30px;
  height: 20px;
  left: -34px;
  top: -12px;
  border-radius: 60% 40% 40% 60% / 70% 70% 30% 30%;
  transform: rotate(-18deg);
}
.bow .r {
  width: 30px;
  height: 20px;
  left: 4px;
  top: -12px;
  border-radius: 40% 60% 60% 40% / 70% 70% 30% 30%;
  transform: rotate(18deg);
}
.bow .k {
  width: 14px;
  height: 14px;
  left: -7px;
  top: -9px;
  border-radius: 50%;
}
</style>
