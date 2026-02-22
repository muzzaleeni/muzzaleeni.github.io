(() => {
  const SOUND_KEY = "runway_sound";
  const UNLOCK_KEY = "runway_sound_unlocked";
  const SYNC_INTERVAL_MS = 1000;

  const video = document.getElementById("runway-video");
  const audio = document.getElementById("runway-audio");
  const soundButton = document.getElementById("sound-toggle");
  const playButton = document.getElementById("play-toggle");
  const statusEl = document.getElementById("media-status");

  if (!video || !audio || !soundButton || !playButton || !statusEl) {
    return;
  }

  const setStatus = (message) => {
    statusEl.textContent = message || "";
  };

  const prefersMobileVideo = window.matchMedia("(max-width: 768px)").matches;
  const supportsWebm = video.canPlayType("video/webm") !== "";

  const desiredVideoSrc = (() => {
    if (prefersMobileVideo && supportsWebm && video.dataset.mobileWebm) {
      return video.dataset.mobileWebm;
    }
    if (prefersMobileVideo && video.dataset.mobileSrc) {
      return video.dataset.mobileSrc;
    }
    if (supportsWebm && video.dataset.desktopWebm) {
      return video.dataset.desktopWebm;
    }
    return video.dataset.desktopSrc || "";
  })();

  if (desiredVideoSrc) {
    const current = video.currentSrc || video.getAttribute("src") || "";
    if (!current.endsWith(desiredVideoSrc)) {
      video.src = desiredVideoSrc;
    }
  }

  if (audio.dataset.fallbackSrc && audio.canPlayType("audio/mp4") === "") {
    audio.src = audio.dataset.fallbackSrc;
  }

  let soundEnabled = localStorage.getItem(SOUND_KEY) === "on";
  const userUnlockedAudio = localStorage.getItem(UNLOCK_KEY) === "1";
  let syncHandle;
  let videoSyncEnabled = true;

  const setSoundButtonState = () => {
    soundButton.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
    soundButton.textContent = soundEnabled ? "Sound Off" : "Sound On";
  };

  const safeModulo = (value, duration) => {
    if (!duration || !Number.isFinite(duration) || duration <= 0) {
      return 0;
    }
    return ((value % duration) + duration) % duration;
  };

  const syncAudioToVideo = () => {
    if (!soundEnabled || audio.paused || !videoSyncEnabled) {
      return;
    }

    if (
      video.paused ||
      video.readyState < 2 ||
      !Number.isFinite(video.duration) ||
      video.duration <= 0 ||
      !Number.isFinite(video.currentTime)
    ) {
      return;
    }

    const desiredTime = audio.duration ? safeModulo(video.currentTime, audio.duration) : video.currentTime;
    if (!Number.isFinite(desiredTime)) {
      return;
    }

    if (Math.abs(audio.currentTime - desiredTime) > 0.35) {
      audio.currentTime = desiredTime;
    }
  };

  const startSyncLoop = () => {
    if (syncHandle) {
      clearInterval(syncHandle);
    }
    syncHandle = setInterval(syncAudioToVideo, SYNC_INTERVAL_MS);
  };

  const stopSyncLoop = () => {
    if (syncHandle) {
      clearInterval(syncHandle);
      syncHandle = undefined;
    }
  };

  const attemptVideoAutoplay = async () => {
    try {
      await video.play();
      playButton.classList.add("hidden");
      setStatus("");
    } catch (error) {
      playButton.classList.remove("hidden");
      setStatus("Tap to start the runway film.");
    }
  };

  const startAudio = async () => {
    syncAudioToVideo();
    try {
      await audio.play();
      setStatus("");
      startSyncLoop();
      return true;
    } catch (error) {
      soundEnabled = false;
      setSoundButtonState();
      localStorage.setItem(SOUND_KEY, "off");
      setStatus("Sound is blocked until a direct user gesture.");
      stopSyncLoop();
      return false;
    }
  };

  const stopAudio = () => {
    audio.pause();
    stopSyncLoop();
  };

  const applySoundPreference = async () => {
    setSoundButtonState();

    if (!soundEnabled) {
      stopAudio();
      return;
    }

    if (!userUnlockedAudio) {
      soundEnabled = false;
      setSoundButtonState();
      localStorage.setItem(SOUND_KEY, "off");
      return;
    }

    await startAudio();
  };

  soundButton.addEventListener("click", async () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem(SOUND_KEY, soundEnabled ? "on" : "off");

    if (soundEnabled) {
      localStorage.setItem(UNLOCK_KEY, "1");
      await startAudio();
    } else {
      stopAudio();
      setStatus("");
      setSoundButtonState();
    }

    setSoundButtonState();
  });

  playButton.addEventListener("click", async () => {
    await attemptVideoAutoplay();
    if (soundEnabled) {
      await startAudio();
      setSoundButtonState();
    }
  });

  video.addEventListener("seeked", syncAudioToVideo);
  video.addEventListener("playing", syncAudioToVideo);
  video.addEventListener("ended", syncAudioToVideo);

  document.addEventListener("visibilitychange", async () => {
    if (document.hidden) {
      if (!audio.paused) {
        audio.pause();
      }
      return;
    }

    if (soundEnabled) {
      await startAudio();
    }
  });

  video.addEventListener("error", () => {
    videoSyncEnabled = false;
    setStatus("Runway video file is missing. Add files to /assets as documented.");
  });

  audio.addEventListener("error", () => {
    if (soundEnabled) {
      setStatus("Runway audio file is missing. Add files to /assets as documented.");
    }
  });

  setSoundButtonState();
  attemptVideoAutoplay();
  applySoundPreference();
})();
