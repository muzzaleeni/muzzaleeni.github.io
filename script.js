(() => {
  document.documentElement.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection && connection.saveData);
  const shouldEnhance = !reduceMotion && !saveData;

  const hexToRgb = (hex) => {
    const raw = (hex || "").replace("#", "").trim();
    if (raw.length !== 6) {
      return { r: 125, g: 212, b: 255 };
    }
    return {
      r: Number.parseInt(raw.slice(0, 2), 16),
      g: Number.parseInt(raw.slice(2, 4), 16),
      b: Number.parseInt(raw.slice(4, 6), 16)
    };
  };

  const tickerPhrases = [
    "shipping production-grade backend work at bmw group.",
    "turning requirements into deployable systems.",
    "building fast, then hardening for production.",
    "optimizing for clarity, reliability, and speed."
  ];

  const ticker = document.getElementById("ticker");
  if (ticker && shouldEnhance) {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const phrase = tickerPhrases[phraseIndex];
      if (!deleting) {
        charIndex += 1;
        ticker.textContent = phrase.slice(0, charIndex);
        if (charIndex === phrase.length) {
          deleting = true;
          setTimeout(tick, 1300);
          return;
        }
      } else {
        charIndex -= 1;
        ticker.textContent = phrase.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % tickerPhrases.length;
        }
      }
      setTimeout(tick, deleting ? 30 : 56);
    };

    ticker.textContent = "";
    setTimeout(tick, 260);
  }

  const revealTargets = document.querySelectorAll(".reveal");
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const sceneSections = Array.from(document.querySelectorAll("section[data-scene]"));

  let activeColor = "#7dd4ff";

  const updateScene = (section) => {
    const scene = section.dataset.scene || "hero";
    const light = section.dataset.light || "#7dd4ff";
    const rgb = hexToRgb(light);
    activeColor = light;

    document.documentElement.style.setProperty("--scene-accent", light);
    document.documentElement.style.setProperty("--scene-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    document.body.dataset.scene = scene;

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle("active", href === `#${section.id}`);
    });
  };

  const initiallyVisible = document.querySelectorAll(".call-sheet.reveal, .hero.reveal");
  initiallyVisible.forEach((el) => el.classList.add("is-visible"));

  if (sceneSections.length > 0) {
    updateScene(sceneSections[0]);
  }

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.16 }
    );

    revealTargets.forEach((target) => revealObserver.observe(target));

    const sceneObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateScene(entry.target);
          }
        });
      },
      { rootMargin: "-42% 0px -42% 0px" }
    );

    sceneSections.forEach((section) => sceneObserver.observe(section));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  const initPointerInteractions = () => {
    const magneticTargets = document.querySelectorAll(".magnetic");
    magneticTargets.forEach((el) => {
      el.addEventListener("mousemove", (event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0, 0)";
      });
    });

    const tiltCards = document.querySelectorAll(".tilt");
    tiltCards.forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width;
        const relY = (event.clientY - rect.top) / rect.height;
        const rotateY = (relX - 0.5) * 8;
        const rotateX = (0.5 - relY) * 8;
        card.style.transform = `perspective(760px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(760px) rotateX(0deg) rotateY(0deg)";
      });
    });
  };

  const initLightingCanvas = () => {
    const canvas = document.getElementById("light-canvas");
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let width = 0;
    let height = 0;
    let animationId;
    const beams = [
      { phase: 0.4, speed: 0.0022, width: 90 },
      { phase: 2.1, speed: 0.0017, width: 70 }
    ];

    const particles = [];
    const particleCount = Math.min(48, Math.floor(window.innerWidth / 26));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resetParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: Math.random() * 0.34 + 0.05,
          r: Math.random() * 1.2 + 0.2
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const rgb = hexToRgb(activeColor);

      beams.forEach((beam, index) => {
        beam.phase += beam.speed;
        const lane = Math.sin(beam.phase + index) * 0.5 + 0.5;
        const x = lane * width;
        const grad = ctx.createLinearGradient(x - beam.width, 0, x + beam.width, 0);
        grad.addColorStop(0, "rgba(0, 0, 0, 0)");
        grad.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`);
        grad.addColorStop(0.52, "rgba(255, 255, 255, 0.1)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(x - beam.width, 0, beam.width * 2, height);
      });

      particles.forEach((particle) => {
        particle.y += particle.vy;
        particle.x += particle.vx;

        if (particle.y > height + 8) {
          particle.y = -8;
          particle.x = Math.random() * width;
        }

        if (particle.x < -4 || particle.x > width + 4) {
          particle.vx *= -1;
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`;
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", () => {
      resize();
      resetParticles();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        draw();
      }
    });

    resize();
    resetParticles();
    draw();
  };

  const startEnhancements = () => {
    if (!shouldEnhance || document.body.classList.contains("enhanced")) {
      return;
    }

    document.body.classList.add("enhanced");
    initPointerInteractions();
    initLightingCanvas();
  };

  if (shouldEnhance) {
    const scheduleEnhancements = () => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(startEnhancements, { timeout: 1500 });
      } else {
        setTimeout(startEnhancements, 900);
      }
    };

    if (document.readyState === "complete") {
      scheduleEnhancements();
    } else {
      window.addEventListener("load", scheduleEnhancements, { once: true });
    }
  }
})();
