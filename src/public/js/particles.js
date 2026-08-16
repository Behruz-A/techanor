/* Techanor particles configuration */

if (typeof particlesJS === "function") {
  const techanorPrimary = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || "#4F46E5";
  particlesJS("particles-js", {
    particles: {
      number: {
        value: 140,
        density: {
          enable: true,
          value_area: 900,
        },
      },
      color: {
        value: techanorPrimary,
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000",
        },
      },
      opacity: {
        value: 0.52,
        random: true,
        anim: {
          enable: false,
          speed: 1,
          opacity_min: 0.15,
          sync: false,
        },
      },
      size: {
        value: 2.5,
        random: true,
        anim: {
          enable: false,
          speed: 40,
          size_min: 0.1,
          sync: false,
        },
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: techanorPrimary,
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: true,
        speed: 6,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "repulse",
        },
        onclick: {
          enable: true,
          mode: "push",
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 200,
          duration: 0.4,
        },
        push: {
          particles_nb: 4,
        },
      },
    },
    retina_detect: true,
  });

  const techanorPalettes = [[techanorPrimary, techanorPrimary, techanorPrimary]];
  const techanorLineColors = [techanorPrimary];
  const paletteDuration = 5500;
  const particlesInstance = window.pJSDom && window.pJSDom[0];

  function hexToRgb(hex) {
    const value = parseInt(hex.slice(1), 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255,
    };
  }

  function mixColor(from, to, amount) {
    const start = hexToRgb(from);
    const end = hexToRgb(to);
    return {
      r: Math.round(start.r + (end.r - start.r) * amount),
      g: Math.round(start.g + (end.g - start.g) * amount),
      b: Math.round(start.b + (end.b - start.b) * amount),
    };
  }

  if (particlesInstance && particlesInstance.pJS) {
    const pJS = particlesInstance.pJS;
    const startedAt = performance.now();

    function updateTechanorPalette(now) {
      const elapsed = now - startedAt;
      const palettePosition = elapsed / paletteDuration;
      const currentIndex = Math.floor(palettePosition) % techanorPalettes.length;
      const nextIndex = (currentIndex + 1) % techanorPalettes.length;
      const rawProgress = palettePosition - Math.floor(palettePosition);
      const smoothProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
      const particles = pJS.particles.array;

      particles.forEach(function (particle, index) {
        const colorIndex = index % techanorPalettes[currentIndex].length;
        particle.color.rgb = mixColor(
          techanorPalettes[currentIndex][colorIndex],
          techanorPalettes[nextIndex][colorIndex],
          smoothProgress,
        );
      });

      pJS.particles.line_linked.color_rgb_line = mixColor(
        techanorLineColors[currentIndex],
        techanorLineColors[nextIndex],
        smoothProgress,
      );

      requestAnimationFrame(updateTechanorPalette);
    }

    requestAnimationFrame(updateTechanorPalette);
  }
}
