import { ref } from "vue";

const MUTE_KEY = "tulip-muted";

/**
 * Background music for the gift.
 *  - type "youtube": plays the audio of a YouTube video through a hidden player
 *  - type "file":    plays /public/song.mp3
 * Browsers only allow sound after a tap, so start() must be called from a click.
 */
export function createMusic(cfg) {
  const type = cfg?.type;
  const enabled =
    (type === "file" && !!cfg.file) ||
    (type === "youtube" &&
      !!cfg.youtubeId &&
      !cfg.youtubeId.startsWith("PASTE"));

  const muted = ref(false);
  try {
    muted.value = localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    /* ignore */
  }

  const target = cfg?.volume ?? 0.6; // 0..1
  const startAt = cfg?.startAt ?? 0;

  let audio = null;
  let yt = null;
  let ytReady = false;
  let wantPlay = false;
  let fadeTimer = null;

  /* ---------- volume helpers (0..1) ---------- */
  const getVol = () => (type === "file" ? audio.volume : yt.getVolume() / 100);
  const setVol = (v) => {
    const x = Math.min(1, Math.max(0, v));
    if (type === "file") audio.volume = x;
    else yt.setVolume(Math.round(x * 100));
  };
  function fadeTo(to, ms, done) {
    clearInterval(fadeTimer);
    const from = getVol();
    const steps = Math.max(1, Math.round(ms / 50));
    let n = 0;
    fadeTimer = setInterval(() => {
      n++;
      setVol(from + (to - from) * (n / steps));
      if (n >= steps) {
        clearInterval(fadeTimer);
        done?.();
      }
    }, 50);
  }

  /* ---------- setup (runs on page load, silent) ---------- */
  function loadYouTubeApi() {
    return new Promise((resolve) => {
      if (window.YT?.Player) return resolve();
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    });
  }

  async function init() {
    if (!enabled) return;

    if (type === "file") {
      audio = new Audio(cfg.file);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
    } else {
      await loadYouTubeApi();
      // hidden player: tiny, invisible, can't be tapped
      const wrap = document.createElement("div");
      wrap.style.cssText =
        "position:fixed;left:0;bottom:0;width:200px;height:113px;opacity:.01;pointer-events:none;z-index:-1;overflow:hidden";
      const slot = document.createElement("div");
      wrap.appendChild(slot);
      document.body.appendChild(wrap);

      yt = new window.YT.Player(slot, {
        width: 200,
        height: 113,
        videoId: cfg.youtubeId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          loop: 1,
          playlist: cfg.youtubeId,
          start: startAt,
        },
        events: {
          onReady: () => {
            ytReady = true;
            yt.setVolume(0);
            if (wantPlay) playNow();
          },
          onStateChange: (e) => {
            // safety loop in case the native loop doesn't kick in
            if (e.data === window.YT.PlayerState.ENDED) {
              yt.seekTo(startAt);
              yt.playVideo();
            }
          },
        },
      });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pausePlayer();
      else if (wantPlay && !muted.value) playNow();
    });
  }

  /* ---------- play / pause ---------- */
  function pausePlayer() {
    if (type === "file") audio?.pause();
    else if (ytReady) yt.pauseVideo();
  }

  function playNow() {
    if (!enabled || muted.value) return;
    if (type === "file") {
      audio
        .play()
        .then(() => fadeTo(target, 3000))
        .catch(() => {});
    } else if (yt && ytReady) {
      yt.playVideo();
      fadeTo(target, 3000);
    }
  }

  // call from the "Tap to open" click
  function start() {
    wantPlay = true;
    playNow();
  }

  // 🔊 / 🔇 button
  function toggle() {
    if (!enabled) return;
    if (muted.value) {
      muted.value = false;
      save();
      wantPlay = true;
      playNow();
    } else {
      muted.value = true;
      save();
      fadeTo(0, 400, pausePlayer);
    }
  }
  function save() {
    try {
      localStorage.setItem(MUTE_KEY, muted.value ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  return { enabled, muted, init, start, toggle };
}
