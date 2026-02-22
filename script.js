(() => {
  const SOUND_KEY = "site_sound";
  const UNLOCK_KEY = "site_sound_unlocked";
  const SYNC_INTERVAL_MS = 2000;
  const INTRO_DELAY_MS = 1000;
  const INPUT_DEDUP_MS = 450;
  const TIMECODE_UPDATE_MS = 250;

  const stage = document.querySelector(".film-stage");
  const video = document.getElementById("scene-video");
  const audio = document.getElementById("scene-audio");
  const soundButton = document.getElementById("sound-toggle");
  const statusEl = document.getElementById("media-status");
  const timecodeEl = document.getElementById("timecode");
  const copyrightYearEl = document.getElementById("copyright-year");
  const editionStampEl = document.getElementById("edition-stamp");

  if (!stage || !video || !audio || !soundButton || !statusEl || !timecodeEl) {
    return;
  }

  if (copyrightYearEl) {
    copyrightYearEl.textContent = String(new Date().getFullYear());
  }

  const setEditionStamp = () => {
    if (!editionStampEl) {
      return;
    }

    const now = new Date();
    const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekday = (local.getDay() + 6) % 7; // Monday=0...Sunday=6
    local.setDate(local.getDate() - weekday + 3); // Thursday of current ISO week

    const isoYear = local.getFullYear();
    const firstThursday = new Date(isoYear, 0, 4);
    const firstWeekday = (firstThursday.getDay() + 6) % 7;
    firstThursday.setDate(firstThursday.getDate() - firstWeekday + 3);

    const isoWeek = 1 + Math.round((local - firstThursday) / 604800000);
    const season = String(isoYear).slice(-2);
    const week = String(isoWeek).padStart(2, "0");
    const stamp = `S${season}.W${week}`;

    editionStampEl.textContent = stamp;
    editionStampEl.setAttribute("aria-label", `edition ${stamp}`);
  };

  const setStatus = (message) => {
    statusEl.textContent = message || "";
  };

  const readStorage = (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const writeStorage = (key, value) => {
    const commit = () => {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        // Ignore storage write failures in privacy mode.
      }
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(commit, { timeout: 800 });
      return;
    }

    setTimeout(commit, 0);
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

  let soundEnabled = readStorage(SOUND_KEY) === "on";
  let userUnlockedAudio = readStorage(UNLOCK_KEY) === "1";
  let syncHandle;
  let videoSyncEnabled = true;
  let needsGestureForPlayback = false;
  let lastTimecodeUpdateAt = 0;
  let lastTimecodeCurrent = -1;
  let lastTimecodeDuration = -1;

  const setSoundButtonState = () => {
    soundButton.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
    soundButton.textContent = soundEnabled ? "sound off" : "sound on";
  };

  const pad2 = (value) => String(Math.max(0, value)).padStart(2, "0");

  const formatTimecode = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "00:00";
    }
    const total = Math.floor(seconds);
    return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
  };

  const updateTimecode = (force = false) => {
    const current = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    const now = performance.now();
    const currentWhole = Math.floor(current);
    const durationWhole = Math.floor(duration);

    if (
      !force &&
      now - lastTimecodeUpdateAt < TIMECODE_UPDATE_MS &&
      currentWhole === lastTimecodeCurrent &&
      durationWhole === lastTimecodeDuration
    ) {
      return;
    }

    lastTimecodeUpdateAt = now;
    lastTimecodeCurrent = currentWhole;
    lastTimecodeDuration = durationWhole;
    timecodeEl.textContent = `${formatTimecode(current)} / ${formatTimecode(duration)}`;
  };

  const safeModulo = (value, duration) => {
    if (!duration || !Number.isFinite(duration) || duration <= 0) {
      return 0;
    }
    return ((value % duration) + duration) % duration;
  };

  const syncAudioToVideo = () => {
    if (!soundEnabled || audio.paused || !videoSyncEnabled || audio.readyState < 1) {
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

    if (Math.abs(audio.currentTime - desiredTime) > 0.45) {
      if (typeof audio.fastSeek === "function") {
        audio.fastSeek(desiredTime);
      } else {
        audio.currentTime = desiredTime;
      }
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

  const markVideoLive = () => {
    document.body.classList.add("video-live");
  };

  const startAudio = async () => {
    try {
      await audio.play();
      setStatus("");
      startSyncLoop();
      requestAnimationFrame(syncAudioToVideo);
      return true;
    } catch (error) {
      soundEnabled = false;
      setSoundButtonState();
      writeStorage(SOUND_KEY, "off");
      setStatus("Sound is blocked until direct interaction.");
      stopSyncLoop();
      return false;
    }
  };

  const stopAudio = () => {
    audio.pause();
    stopSyncLoop();
  };

  const attemptVideoAutoplay = async () => {
    try {
      await video.play();
      markVideoLive();
      setStatus("");
      needsGestureForPlayback = false;
      return true;
    } catch (error) {
      needsGestureForPlayback = true;
      setStatus("Tap anywhere to start film.");
      return false;
    }
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
      writeStorage(SOUND_KEY, "off");
      return;
    }

    await startAudio();
  };

  const handleSoundToggle = async () => {
    soundEnabled = !soundEnabled;
    writeStorage(SOUND_KEY, soundEnabled ? "on" : "off");
    setSoundButtonState();

    if (soundEnabled) {
      userUnlockedAudio = true;
      writeStorage(UNLOCK_KEY, "1");
      await startAudio();
      return;
    }

    stopAudio();
    setStatus(needsGestureForPlayback ? "Tap anywhere to start film." : "");
  };

  const handleFirstPaintGesture = async () => {
    if (!needsGestureForPlayback) {
      return;
    }

    const started = await attemptVideoAutoplay();
    if (started && soundEnabled) {
      await startAudio();
      setSoundButtonState();
    }
  };

  const bindFastActivate = (element, handler) => {
    let lastPointerTime = -Infinity;

    element.addEventListener(
      "pointerup",
      (event) => {
        if (event.button !== 0) {
          return;
        }
        lastPointerTime = performance.now();
        handler();
      },
      { passive: true }
    );

    element.addEventListener("click", () => {
      if (performance.now() - lastPointerTime < INPUT_DEDUP_MS) {
        return;
      }
      handler();
    });
  };

  bindFastActivate(soundButton, handleSoundToggle);

  stage.addEventListener("pointerup", handleFirstPaintGesture, { passive: true });
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTypingTarget =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLElement && target.isContentEditable);

    if (isTypingTarget) {
      return;
    }

    const isResumeHotkey =
      (event.code === "KeyR" || event.key.toLowerCase() === "r") &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey;

    if (isResumeHotkey) {
      event.preventDefault();
      window.location.assign("resume.pdf");
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      handleFirstPaintGesture();
    }
  });

  video.addEventListener("timeupdate", () => {
    updateTimecode(false);
  });
  video.addEventListener("durationchange", () => updateTimecode(true));
  video.addEventListener("loadedmetadata", () => updateTimecode(true));
  video.addEventListener("seeked", () => {
    updateTimecode(true);
    syncAudioToVideo();
  });
  video.addEventListener("playing", () => {
    markVideoLive();
    updateTimecode(true);
    syncAudioToVideo();
  });

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
    setStatus("Background video file is missing. Add files to /assets.");
  });

  audio.addEventListener("error", () => {
    if (soundEnabled) {
      setStatus("Background audio file is missing. Add files to /assets.");
    }
  });

  setSoundButtonState();
  updateTimecode();
  setEditionStamp();

  setTimeout(async () => {
    await attemptVideoAutoplay();
    await applySoundPreference();
  }, INTRO_DELAY_MS);
})();
