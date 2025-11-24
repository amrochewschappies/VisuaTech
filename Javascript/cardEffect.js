// -----------------------------------------------
// CardSwap - vanilla JS version using GSAP
// -----------------------------------------------

function initCardSwap(container, options = {}) {
  if (!container || !window.gsap) return;

  const cards = Array.from(container.querySelectorAll(".swap-card"));
  const total = cards.length;
  if (total === 0) return;

  const cardDistance = options.cardDistance ?? 70;
  const verticalDistance = options.verticalDistance ?? 55;
  const delay = options.delay ?? 5000;
  const pauseOnHover = options.pauseOnHover ?? true;
  const skewAmount = options.skewAmount ?? 6;
  const easing = options.easing ?? "elastic";

  const config =
    easing === "elastic"
      ? {
          ease: "elastic.out(0.6,0.9)",
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: "power1.inOut",
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };

  const makeSlot = (i) => ({
    x: i * cardDistance,
    y: -i * verticalDistance,
    z: -i * cardDistance * 1.5,
    zIndex: total - i,
  });

  const placeNow = (el, slot, skew) =>
    gsap.set(el, {
      x: slot.x,
      y: slot.y,
      z: slot.z,
      xPercent: -50,
      yPercent: -50,
      skewY: skew,
      transformOrigin: "center center",
      zIndex: slot.zIndex,
      force3D: true,
    });

  // initial placement
  cards.forEach((card, i) => placeNow(card, makeSlot(i), skewAmount));

  let order = Array.from({ length: total }, (_, i) => i);
  let tl = null;
  let intervalId = null;

  const swap = () => {
    if (order.length < 2) return;

    const [front, ...rest] = order;
    const elFront = cards[front];
    tl = gsap.timeline();

    // drop front card downwards
    tl.to(elFront, {
      y: "+=500",
      duration: config.durDrop,
      ease: config.ease,
    });

    // promote others forward
    tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
    rest.forEach((idx, i) => {
      const el = cards[idx];
      const slot = makeSlot(i);
      tl.set(el, { zIndex: slot.zIndex }, "promote");
      tl.to(
        el,
        {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          duration: config.durMove,
          ease: config.ease,
        },
        `promote+=${i * 0.15}`
      );
    });

    const backSlot = makeSlot(total - 1);
    tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
    tl.call(
      () => {
        gsap.set(elFront, { zIndex: backSlot.zIndex });
      },
      undefined,
      "return"
    );
    tl.to(
      elFront,
      {
        x: backSlot.x,
        y: backSlot.y,
        z: backSlot.z,
        duration: config.durReturn,
        ease: config.ease,
      },
      "return"
    );

    tl.call(() => {
      order = [...rest, front];
    });
  };

  const startInterval = () => {
    intervalId = window.setInterval(swap, delay);
  };

  const clearSwapInterval = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  // kick it off
  swap();
  startInterval();

  if (pauseOnHover) {
    const pause = () => {
      if (tl) tl.pause();
      clearSwapInterval();
    };
    const resume = () => {
      if (tl) tl.play();
      if (!intervalId) startInterval();
    };

    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);
  }
}

// init once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const swapContainer = document.getElementById("businessFeaturesSwap");
  if (swapContainer) {
    initCardSwap(swapContainer, {
      cardDistance: 70,
      verticalDistance: 55,
      delay: 5000,
      pauseOnHover: true,
      skewAmount: 6,
      easing: "elastic",
    });
  }
});
