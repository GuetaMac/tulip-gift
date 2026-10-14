<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import Tulip from "./components/Tulip.vue";
import MiniTulip from "./components/MiniTulip.vue";
import Bouquet from "./components/Bouquet.vue";
import { config } from "./config";
import { createMusic } from "./music";

/* ---------- intro gate + background music ---------- */
const intro = config.intro ?? {
  title: "I made something for you",
  button: "Tap to open",
};
const {
  enabled: musicEnabled,
  muted,
  init: initMusic,
  start: startMusic,
  toggle: toggleMusic,
} = createMusic(config.music);

// separate song for the countdown screen
const {
  enabled: lockMusicEnabled,
  blocked: lockMusicBlocked,
  start: startLockMusic,
  stop: stopLockMusic,
  toggle: toggleLockMusic,
} = createMusic(config.lockMusic);

const started = ref(false);
function openGift() {
  started.value = true;
  stopLockMusic(); // countdown song fades out
  startMusic(); // runs inside the tap, so the browser allows sound
}

/* ---------- countdown lock (opens on config.unlockAt) ---------- */
const unlockTime = config.unlockAt ? new Date(config.unlockAt).getTime() : 0;
// secret preview so YOU can still open the app early: yoursite.app/?preview=KEY
const previewOn =
  !!config.previewKey &&
  new URLSearchParams(window.location.search).get("preview") ===
    config.previewKey;
const now = ref(Date.now());
const tick = now; // alias, used inside months below
const locked = computed(() => !previewOn && unlockTime > now.value);
const left = computed(() => {
  const s = Math.max(0, Math.floor((unlockTime - now.value) / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
});
// load the countdown song while locked, the main song once unlocked
watch(
  locked,
  (isLocked) => {
    if (isLocked)
      startLockMusic(); // tries to play by itself
    else initMusic();
  },
  { immediate: true },
);
const pad = (n) => String(n).padStart(2, "0");
const lockBoxes = computed(() => [
  { label: "days", value: left.value.d },
  { label: "hours", value: pad(left.value.h) },
  { label: "min", value: pad(left.value.m) },
  { label: "sec", value: pad(left.value.s) },
]);
let clock = null;
onMounted(() => {
  clock = setInterval(() => (now.value = Date.now()), 1000);
});
onBeforeUnmount(() => clearInterval(clock));

/* ---------- 3D tilt (follows finger / mouse) ---------- */
const rx = ref(0);
const ry = ref(0);
function onMove(e) {
  ry.value = (e.clientX / window.innerWidth - 0.5) * 16;
  rx.value = -(e.clientY / window.innerHeight - 0.5) * 10;
}

/* ---------- monthsary count ---------- */
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const startDay = new Date(config.startDate + "T00:00:00").getDate() || 30;

// How many monthsaries have been completed. It goes up every time the 30th arrives.
// In months without a 30th (Feb), it goes up on the last day of the month.
const months = computed(() => {
  if (config.monthOverride) return config.monthOverride;
  const start = new Date(config.startDate + "T00:00:00");
  if (isNaN(start)) return 0;
  const now = new Date(tick.value); // updates live, so the new tulip appears at midnight
  let m =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  const daysInThisMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const target = Math.min(start.getDate(), daysInThisMonth);
  if (now.getDate() < target) m -= 1;
  return Math.max(m, 0);
});

const title = computed(() => {
  const n = months.value;
  if (n === 0) return "Happy Monthsary";
  if (n % 12 === 0) return `Happy ${ordinal(n / 12)} Anniversary`;
  return `Happy ${ordinal(n)} Monthsary`;
});

/* ---------- countdown to the next monthsary ---------- */
const nextTarget = computed(() => {
  const cur = new Date(now.value);
  const at = (y, m) =>
    new Date(y, m, Math.min(startDay, new Date(y, m + 1, 0).getDate()));
  let t = at(cur.getFullYear(), cur.getMonth());
  if (t <= cur) t = at(cur.getFullYear(), cur.getMonth() + 1);
  return t.getTime();
});
const nextLeft = computed(() => {
  const s = Math.max(0, Math.floor((nextTarget.value - now.value) / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
});
const nextDateLabel = computed(() =>
  new Date(nextTarget.value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  }),
);

/* ---------- tulips ----------
   Regular months: the newest months = big 3D tulips,
   older ones = small tulips in the bottom row (newest first).
   On anniversaries (12, 24, 36...): the 12 months of that year become a bouquet. */
const bouquetMode = computed(() => months.value > 0 && months.value % 12 === 0);
const yearsDone = computed(() => Math.floor(months.value / 12));

const heroFrom = computed(() =>
  bouquetMode.value
    ? months.value - 12
    : Math.max(0, months.value - config.featuredCount),
);
const featured = computed(() =>
  Array.from({ length: months.value - heroFrom.value }, (_, k) => ({
    i: heroFrom.value + k,
  })),
);
const past = computed(() =>
  Array.from({ length: heroFrom.value }, (_, k) => ({
    i: heroFrom.value - 1 - k,
  })),
);

// Bouquets of completed years (can be reopened anytime)
const keepsakeYears = computed(() => {
  const all = Array.from({ length: yearsDone.value }, (_, k) => k + 1);
  return bouquetMode.value ? all.filter((y) => y !== yearsDone.value) : all;
});
const showYear = ref(null);

const opened = reactive(new Set());
const featuredOpened = computed(
  () => featured.value.filter((t) => opened.has(t.i)).length,
);
const current = ref(null);
const finaleShown = ref(false);

function palette(i) {
  return config.palettes[i % config.palettes.length];
}
function pick(i) {
  opened.add(i);
  current.value = {
    text: config.messages[i % config.messages.length],
    label: `${ordinal(i + 1)} monthsary`,
    finale: false,
  };
}
function closeCard() {
  current.value = null;
  if (
    showYear.value === null &&
    featured.value.length &&
    featuredOpened.value === featured.value.length &&
    !finaleShown.value
  ) {
    finaleShown.value = true;
    const fin = bouquetMode.value
      ? {
          ...config.anniversaryFinale,
          text: config.anniversaryFinale.text.replace(
            "{years}",
            yearsDone.value,
          ),
        }
      : config.finale;
    setTimeout(() => {
      current.value = { ...fin, finale: true };
    }, 500);
  }
}

/* ---------- typewriter message ---------- */
const typed = ref("");
let typeTimer = null;
watch(current, (v) => {
  clearInterval(typeTimer);
  typed.value = "";
  if (!v) return;
  const chars = Array.from(v.text);
  const reduce = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reduce) {
    typed.value = v.text;
    return;
  }
  let n = 0;
  typeTimer = setInterval(() => {
    n++;
    typed.value = chars.slice(0, n).join("");
    if (n >= chars.length) clearInterval(typeTimer);
  }, 32);
});
onBeforeUnmount(() => clearInterval(typeTimer));

/* ---------- twinkling stars ---------- */
const stars = Array.from({ length: 40 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 75,
  size: 1 + Math.random() * 2.2,
  dur: 2.5 + Math.random() * 4,
  delay: -Math.random() * 6,
}));

/* ---------- falling hearts background ---------- */
const chars = ["🌸", "💗", "✨", "🌷", "💖"];
const drifters = Array.from({ length: 16 }, (_, i) => ({
  ch: chars[i % chars.length],
  left: Math.random() * 100,
  delay: -Math.random() * 14,
  dur: 10 + Math.random() * 8,
  size: 12 + Math.random() * 14,
}));
</script>

<template>
  <div
    class="relative min-h-dvh overflow-hidden bg-linear-to-b from-[#2a0f2e] via-[#6b1f4b] to-[#e0658f] text-white select-none"
    @pointermove="onMove"
  >
    <!-- soft glows + stars -->
    <div
      class="aurora"
      style="
        top: -10%;
        left: -15%;
        width: 60vmax;
        height: 60vmax;
        background: #ff5c9d;
      "
    ></div>
    <div
      class="aurora"
      style="
        bottom: -20%;
        right: -20%;
        width: 55vmax;
        height: 55vmax;
        background: #a855f7;
        animation-delay: -6s;
      "
    ></div>
    <span
      v-for="(st, i) in stars"
      :key="'s' + i"
      class="star"
      :style="{
        left: st.left + '%',
        top: st.top + '%',
        width: st.size + 'px',
        height: st.size + 'px',
        animationDuration: st.dur + 's',
        animationDelay: st.delay + 's',
      }"
    ></span>

    <!-- falling hearts / petals -->
    <span
      v-for="(d, i) in drifters"
      :key="i"
      class="drifter"
      :style="{
        left: d.left + '%',
        fontSize: d.size + 'px',
        animationDuration: d.dur + 's',
        animationDelay: d.delay + 's',
      }"
      >{{ d.ch }}</span
    >

    <main
      v-if="started"
      class="relative z-10 mx-auto flex min-h-dvh max-w-4xl flex-col items-center px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]"
    >
      <!-- our photo -->
      <div
        v-if="config.couplePhoto"
        class="mb-3 rounded-full bg-linear-to-br from-pink-300 via-pink-500 to-purple-500 p-1 shadow-[0_0_35px_rgba(255,120,180,0.55)]"
      >
        <img
          :src="config.couplePhoto"
          alt="Us"
          class="size-28 rounded-full border-2 border-white/80 object-cover sm:size-32"
        />
      </div>

      <p class="font-script text-2xl text-pink-200">for {{ config.herName }}</p>
      <h1
        class="mt-1 text-center font-display text-4xl leading-tight font-bold shimmer sm:text-5xl"
      >
        {{ title }}
      </h1>
      <p v-if="bouquetMode" class="mt-2 font-script text-2xl text-pink-200">
        Our {{ ordinal(yearsDone) }} year bouquet 💐
      </p>
      <p
        v-if="featured.length"
        class="mt-3 max-w-xs text-center text-sm text-pink-100/80"
      >
        Tap each tulip to make it bloom 🌷
      </p>

      <!-- anniversary: bouquet -->
      <div
        v-if="bouquetMode"
        class="flex w-full flex-1 items-center"
        style="perspective: 1000px"
      >
        <div
          class="w-full py-6 transition-transform duration-200 ease-out"
          :style="{ transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }"
        >
          <Bouquet
            :start="months - 12"
            :palettes="config.palettes"
            :opened="opened"
            :fresh-index="months - 1"
            @pick="pick"
          />
        </div>
      </div>

      <!-- regular month: garden of the newest tulips -->
      <div
        v-else
        class="flex w-full flex-1 items-center"
        style="perspective: 1000px"
      >
        <div
          class="flex w-full flex-wrap justify-center gap-y-6 py-6 transition-transform duration-200 ease-out"
          :style="{ transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }"
        >
          <div v-for="t in featured" :key="t.i" class="basis-1/3 md:basis-1/6">
            <Tulip
              :index="t.i"
              :palette="palette(t.i)"
              :opened="opened.has(t.i)"
              :fresh="t.i === months - 1"
              @pick="pick(t.i)"
            />
          </div>
        </div>
      </div>

      <p v-if="featured.length" class="text-sm text-pink-100/80">
        {{ featuredOpened }} / {{ featured.length }} tulips opened
      </p>

      <!-- past months -->
      <section v-if="past.length" class="mt-6 w-full">
        <p class="text-center text-sm text-pink-100/80">Past months 🌷</p>
        <div
          class="mt-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div class="mx-auto flex w-max gap-2 px-2 py-2">
            <MiniTulip
              v-for="t in past"
              :key="t.i"
              :index="t.i"
              :palette="palette(t.i)"
              :opened="opened.has(t.i)"
              @pick="pick(t.i)"
            />
          </div>
        </div>
      </section>

      <!-- bouquets of completed years -->
      <div
        v-if="keepsakeYears.length"
        class="mt-4 flex flex-wrap justify-center gap-2"
      >
        <button
          v-for="y in keepsakeYears"
          :key="y"
          class="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur transition active:scale-95"
          @click="showYear = y"
        >
          💐 {{ ordinal(y) }} year
        </button>
      </div>

      <div class="mt-4 text-center">
        <p class="text-sm text-pink-100/80">
          🌱 Next tulip blooms on {{ nextDateLabel }}
        </p>
        <p
          class="mt-1 font-display text-xl font-bold text-pink-100 tabular-nums"
        >
          {{ nextLeft.d }}d : {{ pad(nextLeft.h) }}h : {{ pad(nextLeft.m) }}m :
          {{ pad(nextLeft.s) }}s
        </p>
      </div>
      <p class="mt-1 font-script text-xl text-pink-200">
        — {{ config.fromName }}
      </p>
    </main>

    <!-- countdown lock: she can't get in until the date arrives -->
    <Transition name="gate">
      <div
        v-if="locked"
        class="fixed inset-0 z-[70] flex flex-col items-center justify-center px-6 text-center"
      >
        <div
          class="animate-pulse text-7xl drop-shadow-[0_0_30px_rgba(255,120,180,0.6)]"
        >
          🌱
        </div>
        <p class="mt-6 font-script text-3xl text-pink-200">
          for {{ config.herName }}
        </p>
        <h1 class="mt-2 font-display text-3xl font-bold">
          {{ config.lock?.title ?? "Something is blooming..." }}
        </h1>
        <div class="mt-8 flex gap-3">
          <div
            v-for="b in lockBoxes"
            :key="b.label"
            class="w-16 rounded-2xl border border-white/20 bg-white/10 py-3 backdrop-blur"
          >
            <div class="font-display text-3xl font-bold tabular-nums">
              {{ b.value }}
            </div>
            <div class="text-[10px] tracking-widest text-pink-200/80 uppercase">
              {{ b.label }}
            </div>
          </div>
        </div>
        <p class="mt-8 max-w-xs text-sm text-pink-100/80">
          {{ config.lock?.hint ?? "Come back when the timer hits zero 💗" }}
        </p>
        <p
          v-if="lockMusicEnabled && lockMusicBlocked"
          class="mt-6 animate-pulse text-xs text-pink-200/80"
        >
          🎵 Tap anywhere to start the music
        </p>
        <button
          v-if="lockMusicEnabled"
          class="fixed right-3 grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 text-lg backdrop-blur transition active:scale-90"
          :style="{ top: 'max(0.75rem, env(safe-area-inset-top))' }"
          :aria-label="muted ? 'Turn music on' : 'Turn music off'"
          @click="toggleLockMusic"
        >
          {{ muted ? "🔇" : "🔊" }}
        </button>
      </div>
    </Transition>

    <!-- intro: she taps once, the page opens and the song starts -->
    <Transition name="gate">
      <div
        v-if="!started && !locked"
        class="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-linear-to-b from-[#2a0f2e] via-[#6b1f4b] to-[#b8467a] px-6 text-center"
      >
        <div
          class="animate-pulse text-7xl drop-shadow-[0_0_30px_rgba(255,120,180,0.6)]"
        >
          🌷
        </div>
        <p class="mt-6 font-script text-3xl text-pink-200">
          for {{ config.herName }}
        </p>
        <h1 class="mt-2 font-display text-3xl font-bold">{{ intro.title }}</h1>
        <button
          class="mt-10 rounded-full bg-pink-500 px-8 py-3 text-lg font-semibold shadow-lg shadow-pink-900/50 transition active:scale-95"
          @click="openGift"
        >
          {{ intro.button }} 💌
        </button>
      </div>
    </Transition>

    <!-- music on/off -->
    <button
      v-if="started && musicEnabled"
      class="fixed right-3 z-30 grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 text-lg backdrop-blur transition active:scale-90"
      :style="{ top: 'max(0.75rem, env(safe-area-inset-top))' }"
      :aria-label="muted ? 'Turn music on' : 'Turn music off'"
      @click="toggleMusic"
    >
      {{ muted ? "🔇" : "🔊" }}
    </button>

    <!-- bouquet of a past year -->
    <Transition name="pop">
      <div
        v-if="showYear"
        class="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
        @click.self="showYear = null"
      >
        <div class="card w-full max-w-md text-center">
          <p class="font-script text-2xl text-pink-200">
            Our {{ ordinal(showYear) }} year bouquet 💐
          </p>
          <div class="mt-4" style="perspective: 1000px">
            <Bouquet
              :start="(showYear - 1) * 12"
              :palettes="config.palettes"
              :opened="opened"
              :fresh-index="-1"
              @pick="pick"
            />
          </div>
          <button
            class="mt-4 rounded-full bg-white/15 px-6 py-2 text-sm font-semibold transition active:scale-95"
            @click="showYear = null"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>

    <!-- message card -->
    <Transition name="pop">
      <div
        v-if="current"
        class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5 backdrop-blur-sm"
        @click.self="closeCard"
      >
        <div
          class="card card-glass w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl"
        >
          <div class="text-5xl">{{ current.finale ? "💐" : "🌷" }}</div>
          <p
            v-if="current.label"
            class="mt-2 text-xs tracking-widest text-pink-200/80 uppercase"
          >
            {{ current.label }}
          </p>
          <h2
            v-if="current.title"
            class="mt-3 font-script text-3xl text-pink-200"
          >
            {{ current.title }}
          </h2>
          <p class="relative mt-3 text-lg leading-relaxed whitespace-pre-line">
            <span class="invisible">{{ current.text }}</span>
            <span class="absolute inset-0">{{ typed }}</span>
          </p>
          <p
            v-if="current.finale"
            class="mt-4 font-script text-2xl text-pink-200"
          >
            — {{ config.fromName }}
          </p>
          <button
            class="mt-6 rounded-full bg-pink-500 px-7 py-2.5 font-semibold shadow-lg shadow-pink-900/40 transition active:scale-95"
            @click="closeCard"
          >
            {{ current.finale ? "Close 💗" : "Aww 💗" }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
