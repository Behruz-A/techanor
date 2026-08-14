/* TechAnor admin home laptop animation */

(function () {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reduceMotion || typeof anime !== "function") {
    document
      .querySelectorAll(".macbook, .screen-link, .admin-welcome")
      .forEach(function (element) {
        element.style.opacity = "1";
        element.style.transform = "none";
      });
    return;
  }

  anime
    .timeline({ easing: "easeOutCubic" })
    .add({
      targets: ".macbook",
      opacity: [0, 1],
      duration: 240,
    })
    .add(
      {
        targets: ".macbook-image-screen",
        rotateX: [-78, 0],
        scaleY: [0.18, 1],
        duration: 1800,
        easing: "easeOutExpo",
      },
      0,
    )
    .add(
      {
        targets: ".screen-link",
        opacity: [0, 1],
        translateY: [7, 0],
        delay: anime.stagger(20),
        duration: 160,
        easing: "easeOutCubic",
      },
      1850,
    )
    .add(
      {
        targets: ".admin-welcome",
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 400,
        easing: "easeOutCubic",
      },
      2150,
    );
})();
