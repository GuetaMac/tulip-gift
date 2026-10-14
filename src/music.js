import { ref } from "vue";

/* Background music helper.
   - type "youtube": plays a hidden YouTube player (use the video ID only)
   - type "file": plays an mp3 from /public
   - type "none": no music
   You can create more than one (e.g. one for the countdown, one for the gift).
   Mute is shared, so if she mutes on the countdown it stays muted after. */

const MUTE_KEY = "gift-muted";
const muted = ref(false);
try {
  muted.value = localStorage.getItem(MUTE_KEY) === "1";
} catch {
  /* storage can be unavailable, ignore */
}

let ytPromise = null;
function loadYT() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (!ytPromise) {
    ytPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        resolve(window.YT);
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    });
  }
  return ytPromise;
}

export function createMusic(cfg) {
  const c = cfg || {};
  const type = c.type || "none";
  const enabled = ref(
    (type === "youtube" && !!c.youtubeId) || (type === "file" && !!c.file),
  );
  const targetVol = Math.min(1, Math.max(0, c.volume ?? 0.6));
  const startAt = c.startAt || 0;

  let player = null; // YouTube player
  let audio = null; // <audio> for mp3
  let host = null; // hidden wrapper for the YouTube iframe
  let ready = false;
  let wanted = false; // should the song be playing right now?
  let fadeTimer = null;

  // If the browser blocks sound, wait for her first touch anywhere, then play
  const blocked = ref(false);
  const UNLOCK_EVENTS = ["pointerdown", "touchend", "click", "keydown"];
  let armed = false;
  let unlockHandler = null;
  let checkTimer = null;

  function isPlaying() {
    try {
      if (player && ready) {
        const st = player.getPlayerState();
        return st === 1 || st === 3; // playing or buffering
      }
      if (audio) return !audio.paused;
    } catch {
      /* ignore */
    }
    return false;
  }

  function disarm() {
    clearTimeout(checkTimer);
    blocked.value = false;
    if (!armed) return;
    armed = false;
    UNLOCK_EVENTS.forEach((ev) =>
      window.removeEventListener(ev, unlockHandler, true),
    );
  }

  function armUnlock() {
    if (armed || !wanted) return;
    armed = true;
    blocked.value = true;
    unlockHandler = () => {
      disarm();
      if (wanted) play();
    };
    UNLOCK_EVENTS.forEach((ev) =>
      window.addEventListener(ev, unlockHandler, true),
    );
  }

  function checkLater() {
    clearTimeout(checkTimer);
    checkTimer = setTimeout(() => {
      if (wanted && !isPlaying()) armUnlock();
    }, 2000);
  }

  function setVol(v) {
    if (player && ready) {
      try {
        player.setVolume(Math.round(v * 100));
      } catch {
        /* ignore */
      }
    }
    if (audio) audio.volume = Math.min(1, Math.max(0, v));
  }

  function fade(from, to, ms, done) {
    clearInterval(fadeTimer);
    const steps = 20;
    let i = 0;
    setVol(from);
    fadeTimer = setInterval(() => {
      i++;
      setVol(from + (to - from) * (i / steps));
      if (i >= steps) {
        clearInterval(fadeTimer);
        if (done) done();
      }
    }, ms / steps);
  }

  function applyMute() {
    if (player && ready) {
      try {
        if (muted.value) player.mute();
        else player.unMute();
      } catch {
        /* ignore */
      }
    }
    if (audio) audio.muted = muted.value;
  }

  function play() {
    if (!wanted) return;
    if (player && ready) {
      try {
        player.seekTo(startAt, true);
        player.setVolume(0);
        applyMute();
        player.playVideo();
      } catch {
        /* ignore */
      }
    }
    if (audio) {
      if (audio.readyState >= 1) audio.currentTime = startAt;
      else
        audio.addEventListener(
          "loadedmetadata",
          () => (audio.currentTime = startAt),
          { once: true },
        );
      audio.volume = 0;
      audio.muted = muted.value;
      audio.play().catch(() => armUnlock());
    }
    fade(0, targetVol, 2000);
    if ((player && ready) || audio) checkLater();
  }

  function init() {
    if (!enabled.value || player || audio) return;

    if (type === "file") {
      audio = new Audio(c.file);
      audio.preload = "auto";
      audio.addEventListener("ended", () => {
        audio.currentTime = startAt;
        audio.play().catch(() => {});
      });
      return;
    }

    // YouTube: hidden off-screen player
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "position:fixed;left:-9999px;top:0;width:200px;height:200px;opacity:0;pointer-events:none;";
    const inner = document.createElement("div");
    wrap.appendChild(inner);
    document.body.appendChild(wrap);
    host = wrap;

    loadYT().then((YT) => {
      if (!host) return; // was stopped before it finished loading
      player = new YT.Player(inner, {
        width: "200",
        height: "200",
        videoId: c.youtubeId,
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            ready = true;
            if (wanted) play();
          },
          onAutoplayBlocked: () => armUnlock(),
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) disarm();
            if (e.data === YT.PlayerState.ENDED && wanted) {
              try {
                player.seekTo(startAt, true);
                player.playVideo();
              } catch {
                /* ignore */
              }
            }
          },
        },
      });
    });
  }

  // call this inside a tap so the browser allows sound
  function start() {
    if (!enabled.value) return;
    init();
    wanted = true;
    play();
  }

  function stop() {
    wanted = false;
    disarm();
    if (!player && !audio && !host) return;
    fade(targetVol, 0, 800, () => {
      if (wanted) return; // started again meanwhile
      try {
        if (player) player.pauseVideo();
        if (audio) audio.pause();
        if (player) player.destroy();
      } catch {
        /* ignore */
      }
      if (host) host.remove();
      player = null;
      audio = null;
      host = null;
      ready = false;
    });
  }

  function toggle() {
    muted.value = !muted.value;
    try {
      localStorage.setItem(MUTE_KEY, muted.value ? "1" : "0");
    } catch {
      /* ignore */
    }
    applyMute();
  }

  // pause when she switches apps, resume when she comes back
  document.addEventListener("visibilitychange", () => {
    if (!wanted) return;
    try {
      if (document.hidden) {
        if (player && ready) player.pauseVideo();
        if (audio) audio.pause();
      } else {
        if (player && ready) player.playVideo();
        if (audio) audio.play().catch(() => {});
      }
    } catch {
      /* ignore */
    }
  });

  return { enabled, muted, blocked, init, start, stop, toggle };
}
