<script setup>
import { ref } from "vue";

const props = defineProps({
  palette: { type: Object, required: true },
  opened: { type: Boolean, default: false },
  index: { type: Number, default: 0 },
  fresh: { type: Boolean, default: false },
});
const emit = defineEmits(["pick"]);

// unique ids so the SVG gradients of each tulip never clash
const uid = "t" + Math.random().toString(36).slice(2, 8);

const symbols = ["💗", "🌸", "✨", "💖", "🌷"];
// z = a tiny twist so no two petals look exactly the same
const petals = [
  { kind: "outer", a: 0, z: -2 },
  { kind: "outer", a: 120, z: 3 },
  { kind: "outer", a: 240, z: -3 },
  { kind: "inner", a: 60, z: 2 },
  { kind: "inner", a: 180, z: -1 },
  { kind: "inner", a: 300, z: 3 },
];

const bursts = ref([]);
const ringKey = ref(0);
let uidCount = 0;

function onClick() {
  emit("pick");
  navigator.vibrate?.(25);

  // expanding ring of light
  ringKey.value++;
  const k = ringKey.value;
  setTimeout(() => {
    if (ringKey.value === k) ringKey.value = 0;
  }, 1000);

  // hearts/sparkles + real petals in this tulip's own colors
  const batch = Array.from({ length: 16 }, (_, n) => {
    const ang = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 100;
    const petal = n >= 9;
    return {
      id: ++uidCount,
      petal,
      ch: symbols[Math.floor(Math.random() * symbols.length)],
      dx: Math.cos(ang) * dist,
      dy: Math.sin(ang) * dist - 60,
      rot: (Math.random() - 0.5) * 420,
      size: 14 + Math.random() * 12,
    };
  });
  bursts.value.push(...batch);
  const ids = new Set(batch.map((b) => b.id));
  setTimeout(() => {
    bursts.value = bursts.value.filter((b) => !ids.has(b.id));
  }, 1600);
}
</script>

<template>
  <div
    class="tulip"
    :class="{ open: opened, fresh }"
    :style="{
      '--c1': palette.c1,
      '--c2': palette.c2,
      '--c3': palette.c3,
      '--delay': index * 0.6 + 's',
    }"
    role="button"
    tabindex="0"
    :aria-label="`Tulip ${index + 1}. Tap to open your message`"
    @click="onClick"
    @keydown.enter.prevent="onClick"
    @keydown.space.prevent="onClick"
  >
    <div class="glow"></div>
    <div class="ground"></div>

    <div class="sway">
      <!-- curved stem + leaves -->
      <svg class="plant" viewBox="0 0 120 270" aria-hidden="true">
        <defs>
          <linearGradient :id="uid + '-stem'" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#14532d" />
            <stop offset="0.5" stop-color="#5fdc8f" />
            <stop offset="1" stop-color="#14532d" />
          </linearGradient>
          <linearGradient :id="uid + '-leaf'" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="#14532d" />
            <stop offset="0.55" stop-color="#22a05a" />
            <stop offset="1" stop-color="#86e8a3" />
          </linearGradient>
        </defs>
        <path
          d="M60 268 C28 252 14 205 22 146 C40 186 54 226 60 268Z"
          :fill="`url(#${uid}-leaf)`"
        />
        <path
          d="M60 268 C94 258 108 222 100 180 C82 208 68 236 60 268Z"
          :fill="`url(#${uid}-leaf)`"
        />
        <path
          d="M60 266 C44 236 32 196 24 152"
          stroke="rgba(255,255,255,.3)"
          stroke-width="1"
          fill="none"
        />
        <path
          d="M60 266 C76 242 90 214 99 184"
          stroke="rgba(255,255,255,.3)"
          stroke-width="1"
          fill="none"
        />
        <path
          d="M60 270 C54 232 68 196 60 96"
          :stroke="`url(#${uid}-stem)`"
          stroke-width="6.5"
          stroke-linecap="round"
          fill="none"
        />
      </svg>

      <div class="head">
        <span class="core"></span>
        <span
          v-for="(p, i) in petals"
          :key="i"
          class="petal"
          :class="p.kind"
          :style="{ '--a': p.a + 'deg', '--z': p.z + 'deg' }"
        ></span>
      </div>
    </div>

    <!-- bloom ring -->
    <span v-if="ringKey" :key="ringKey" class="ring"></span>

    <!-- click burst -->
    <span
      v-for="b in bursts"
      :key="b.id"
      class="particle"
      :class="{ pp: b.petal }"
      :style="{
        '--dx': b.dx + 'px',
        '--dy': b.dy + 'px',
        '--rot': b.rot + 'deg',
        fontSize: b.size + 'px',
      }"
      >{{ b.petal ? "" : b.ch }}</span
    >
  </div>
</template>

<style scoped>
.tulip {
  position: relative;
  width: 100%;
  max-width: 130px;
  height: 270px;
  margin: 0 auto;
  cursor: pointer;
  perspective: 600px;
  perspective-origin: 50% 40%;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  outline: none;
}
/* the newest tulip grows out of the ground when the page opens */
.tulip.fresh {
  transform-origin: 50% 100%;
  animation: grow 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
@keyframes grow {
  0% {
    transform: scale(0.6, 0.05);
    opacity: 0;
  }
  100% {
    transform: none;
    opacity: 1;
  }
}
.tulip:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.7);
  outline-offset: 4px;
  border-radius: 16px;
}

/* the whole flower sways in 3D, pivoting at the stem base */
.sway {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform-origin: 50% 100%;
  animation: sway 6s ease-in-out infinite;
  animation-delay: calc(var(--delay) * -1);
}
@keyframes sway {
  0%,
  100% {
    transform: rotateY(-24deg) rotateZ(-1.5deg);
  }
  50% {
    transform: rotateY(24deg) rotateZ(1.5deg);
  }
}

.plant {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 120px;
  height: 270px;
  margin-left: -60px;
  overflow: visible;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.25));
}

/* flower head sits on top of the stem; petals are arranged around the Y axis */
.head {
  position: absolute;
  left: 50%;
  bottom: 175px;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
  animation: nod 5s ease-in-out infinite;
  animation-delay: calc(var(--delay) * -1);
}
@keyframes nod {
  0%,
  100% {
    transform: rotateZ(-2.5deg);
  }
  50% {
    transform: rotateZ(2.5deg);
  }
}

.petal {
  position: absolute;
  left: -26px;
  top: -80px;
  width: 52px;
  height: 80px;
  border-radius: 50% 50% 46% 46% / 62% 62% 38% 38%;
  background:
    radial-gradient(
      ellipse at 50% 18%,
      rgba(255, 255, 255, 0.4),
      transparent 55%
    ),
    linear-gradient(to top, var(--c3) 0%, var(--c2) 45%, var(--c1) 100%);
  box-shadow:
    inset 0 -10px 18px rgba(0, 0, 0, 0.14),
    inset 0 8px 14px rgba(255, 255, 255, 0.2),
    inset 3px 0 6px rgba(255, 255, 255, 0.12),
    inset -3px 0 6px rgba(0, 0, 0, 0.1);
  transform-origin: 50% 100%;
  transform: rotateY(var(--a)) translateZ(var(--r)) rotateX(var(--t))
    rotateZ(var(--z));
  transition: transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
/* soft vein down the middle of each petal */
.petal::before {
  content: "";
  position: absolute;
  left: 46%;
  top: 14%;
  width: 8%;
  height: 62%;
  border-radius: 50%;
  background: linear-gradient(
    to top,
    transparent,
    rgba(255, 255, 255, 0.34) 50%,
    transparent
  );
  filter: blur(1px);
}
.petal.outer {
  --r: 12px;
  --t: 6deg;
}
.petal.inner {
  --r: 6px;
  --t: 12deg;
  top: -72px;
  height: 72px;
  filter: brightness(0.94);
}

/* bloom! */
.open .petal.outer {
  --t: -30deg;
}
.open .petal.inner {
  --t: -16deg;
}

/* golden center that shows once the tulip opens */
.core {
  position: absolute;
  left: -8px;
  top: -42px;
  width: 16px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 40%,
    #fff6c9 0%,
    #ffc83d 55%,
    transparent 72%
  );
  opacity: 0;
  transition: opacity 1s ease 0.4s;
}
.open .core {
  opacity: 0.95;
}

/* soft pulsing hint behind unopened tulips */
.glow {
  position: absolute;
  left: 50%;
  bottom: 140px;
  width: 130px;
  height: 130px;
  margin-left: -65px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--c2) 0%, transparent 68%);
  opacity: 0.35;
  animation: pulse 2.4s ease-in-out infinite;
  pointer-events: none;
}
.open .glow {
  animation: none;
  opacity: 0.55;
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.55;
  }
}

.ground {
  position: absolute;
  left: 50%;
  bottom: -6px;
  width: 80px;
  height: 14px;
  margin-left: -40px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.35), transparent 70%);
}

.ring {
  position: absolute;
  left: 50%;
  bottom: 205px;
  width: 24px;
  height: 24px;
  margin-left: -12px;
  margin-bottom: -12px;
  border: 2px solid var(--c1);
  border-radius: 50%;
  box-shadow: 0 0 14px var(--c2);
  pointer-events: none;
  animation: ring 0.95s ease-out forwards;
}
@keyframes ring {
  0% {
    transform: scale(0.4);
    opacity: 0.95;
  }
  100% {
    transform: scale(6);
    opacity: 0;
  }
}

.particle {
  position: absolute;
  left: 50%;
  bottom: 200px;
  pointer-events: none;
  animation: burst 1.5s ease-out forwards;
}
/* real petals that fly out in this tulip's colors */
.particle.pp {
  width: 10px;
  height: 15px;
  border-radius: 50% 50% 45% 45% / 65% 65% 35% 35%;
  background: linear-gradient(to top, var(--c3), var(--c1));
}
@keyframes burst {
  0% {
    opacity: 1;
    transform: translate(-50%, 0) scale(0.3);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--dx)), var(--dy)) rotate(var(--rot))
      scale(1.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sway {
    animation: none;
    transform: rotateY(-12deg);
  }
  .head,
  .glow {
    animation: none;
  }
}
</style>
