(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const tickerPhrases = [
    "shipping practical analytics.",
    "turning messy data into products.",
    "building fast, refining with feedback.",
    "optimizing for momentum and impact."
  ];

  const ticker = document.getElementById("ticker");
  if (ticker) {
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
          setTimeout(tick, 1500);
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
      setTimeout(tick, deleting ? 35 : 70);
    };

    if (!reduceMotion) {
      ticker.textContent = "";
      setTimeout(tick, 250);
    }
  }

  const revealTargets = document.querySelectorAll(".reveal");
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  };

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.14 }
    );

    revealTargets.forEach((target) => revealObserver.observe(target));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      { rootMargin: "-35% 0px -45% 0px" }
    );

    document.querySelectorAll("section[id]").forEach((section) => sectionObserver.observe(section));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  if (!reduceMotion) {
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
        card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg)";
      });
    });
  }

  const canvas = document.getElementById("signal-canvas");
  if (!canvas || reduceMotion) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  let width = 0;
  let height = 0;
  let animationId;
  const pointer = { x: -9999, y: -9999 };
  const particleCount = Math.min(72, Math.floor(window.innerWidth / 18));
  const particles = [];

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 1.6 + 0.5
      });
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -8 || p.x > width + 8) {
        p.vx *= -1;
      }
      if (p.y < -8 || p.y > height + 8) {
        p.vy *= -1;
      }

      const dx = pointer.x - p.x;
      const dy = pointer.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140 && dist > 1) {
        p.x -= (dx / dist) * 0.25;
        p.y -= (dy / dist) * 0.25;
      }

      ctx.beginPath();
      ctx.fillStyle = "rgba(141, 244, 255, 0.65)";
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 128) {
          const alpha = (1 - dist / 128) * 0.19;
          ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(draw);
  };

  window.addEventListener("resize", () => {
    resize();
    resetParticles();
  });

  window.addEventListener("mousemove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });

  window.addEventListener("mouseout", () => {
    pointer.x = -9999;
    pointer.y = -9999;
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
})();
