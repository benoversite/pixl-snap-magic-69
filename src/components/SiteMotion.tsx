import { useCallback, useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const loaderKey = "benjamin-portfolio-intro-seen";
const introDuration = 7850;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function IntroLoader({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, introDuration);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="site-loader" aria-hidden="true">
      <span className="loader-greeting">Hello, I’m Benjamin.</span>
      <div className="loader-panels">
        <span className="loader-panel" />
        <span className="loader-panel" />
        <span className="loader-panel" />
        <span className="loader-panel" />
      </div>
    </div>
  );
}

function CustomCursor() {
  return (
    <div className="custom-cursor" aria-hidden="true">
      <span className="cursor-dot" />
      <span className="cursor-ring">
        <span className="cursor-label" />
      </span>
    </div>
  );
}

function LiquidFilter() {
  return (
    <svg className="motion-defs" aria-hidden="true" focusable="false">
      <filter id="liquid-text">
        <feTurbulence
          className="liquid-turbulence"
          type="fractalNoise"
          baseFrequency="0.012 0.04"
          numOctaves="1"
          seed="2"
          result="noise"
        />
        <feDisplacementMap
          className="liquid-displacement"
          in="SourceGraphic"
          in2="noise"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

export function SiteMotion() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const loaderActive = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && prefersReducedMotion(),
  );
  const [showLoader, setShowLoader] = useState(
    () =>
      typeof window !== "undefined" && !window.sessionStorage.getItem(loaderKey) && !reducedMotion,
  );

  loaderActive.current = showLoader;

  const finishLoader = useCallback(() => setShowLoader(false), []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) setShowLoader(false);
  }, [reducedMotion]);

  useEffect(() => {
    if (!showLoader) return;
    window.sessionStorage.setItem(loaderKey, "true");
  }, [showLoader]);

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.085, smoothWheel: true });
    const updateScroll = () => ScrollTrigger.update();
    const frame = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", updateScroll);
    gsap.ticker.add(frame);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", updateScroll);
      gsap.ticker.remove(frame);
      lenis.destroy();
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const pressedTargets = new Map<HTMLElement, number>();
    const onPointerDown = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        ".btn, .hero-project-preview, .home-project-card, .project-card-link, .work-filter button",
      );
      if (!target) return;

      const rect = target.getBoundingClientRect();
      target.style.setProperty("--press-x", `${event.clientX - rect.left}px`);
      target.style.setProperty("--press-y", `${event.clientY - rect.top}px`);
      target.classList.remove("is-pressed");
      void target.offsetWidth;
      target.classList.add("is-pressed");

      const previousTimer = pressedTargets.get(target);
      if (previousTimer) window.clearTimeout(previousTimer);
      pressedTargets.set(
        target,
        window.setTimeout(() => {
          target.classList.remove("is-pressed");
          target.style.removeProperty("--press-x");
          target.style.removeProperty("--press-y");
          pressedTargets.delete(target);
        }, 550),
      );
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      pressedTargets.forEach((timer, target) => {
        window.clearTimeout(timer);
        target.classList.remove("is-pressed");
        target.style.removeProperty("--press-x");
        target.style.removeProperty("--press-y");
      });
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-motion-title]").forEach((title) => {
        gsap.fromTo(
          title.querySelectorAll(".motion-word"),
          { yPercent: 115, rotate: 2, opacity: 0 },
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.02,
            ease: "power4.out",
            delay: loaderActive.current ? 0.65 : 0.12,
          },
        );
      });

      const metadata = gsap.utils.toArray<HTMLElement>("[data-motion-meta]");
      if (metadata.length) {
        gsap.fromTo(
          metadata,
          { y: 16, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            delay: loaderActive.current ? 0.8 : 0.35,
          },
        );
      }

      gsap.utils.toArray<HTMLElement>("[data-motion-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          {
            y: 42,
            rotateX: 4,
            transformPerspective: 900,
            autoAlpha: 0,
            clipPath: "inset(0 0 12% 0)",
          },
          {
            y: 0,
            rotateX: 0,
            autoAlpha: 1,
            clipPath: "inset(0 0 0% 0)",
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-image-reveal]").forEach((container) => {
        const image = container.querySelector("img");
        if (!image) return;
        const reveal = gsap.timeline({
          scrollTrigger: { trigger: container, start: "top 90%", once: true },
        });
        reveal
          .fromTo(
            container,
            { clipPath: "inset(0 0 100% 0)" },
            { clipPath: "inset(0 0 0% 0)", duration: 0.85, ease: "power3.inOut" },
          )
          .fromTo(
            image,
            { scale: 1.12, yPercent: 3 },
            { scale: 1, yPercent: 0, duration: 1.2, ease: "power3.out" },
            0,
          );
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
        gsap.to(element, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [pathname, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)");
    if (!finePointer.matches) return;

    const cursor = document.querySelector<HTMLElement>(".custom-cursor");
    const dot = cursor?.querySelector<HTMLElement>(".cursor-dot");
    const ring = cursor?.querySelector<HTMLElement>(".cursor-ring");
    const label = cursor?.querySelector<HTMLElement>(".cursor-label");
    const displacement =
      document.querySelector<SVGFEDisplacementMapElement>(".liquid-displacement");
    const turbulence = document.querySelector<SVGFETurbulenceElement>(".liquid-turbulence");
    if (!cursor || !dot || !ring || !label || !displacement || !turbulence) return;

    document.body.classList.add("has-custom-cursor");
    const moveDotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3.out" });
    const moveDotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3.out" });
    const moveRingX = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3.out" });
    const moveRingY = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3.out" });
    let currentTarget: HTMLElement | null = null;
    let currentMagnet: HTMLElement | null = null;
    let currentTilt: HTMLElement | null = null;
    let currentLiquid: HTMLElement | null = null;
    let previousX = 0;
    let previousY = 0;
    let liquidTarget = 0;
    let liquidCurrent = 0;
    let animationFrame = 0;

    const resetTilt = (element: HTMLElement | null) => {
      if (!element) return;
      element.classList.remove("is-tilting");
      element.style.removeProperty("--tilt-x");
      element.style.removeProperty("--tilt-y");
      element.style.removeProperty("--glare-x");
      element.style.removeProperty("--glare-y");
    };

    const updateLiquid = () => {
      liquidCurrent += (liquidTarget - liquidCurrent) * 0.18;
      displacement.setAttribute("scale", liquidCurrent.toFixed(1));
      if (Math.abs(liquidTarget - liquidCurrent) > 0.15 || liquidCurrent > 0.15) {
        animationFrame = window.requestAnimationFrame(updateLiquid);
      } else {
        animationFrame = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      cursor.classList.add("is-ready");
      moveDotX(event.clientX);
      moveDotY(event.clientY);
      moveRingX(event.clientX);
      moveRingY(event.clientY);

      const target =
        (event.target as HTMLElement | null)?.closest<HTMLElement>("a, button, [data-cursor]") ??
        null;
      if (target !== currentTarget) {
        currentTarget = target;
        cursor.classList.toggle("is-active", Boolean(target));
        label.textContent = target?.dataset["cursor"] ?? (target ? "OPEN" : "");
      }

      const magnet = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet !== currentMagnet) {
        currentMagnet?.style.setProperty("--mag-x", "0px");
        currentMagnet?.style.setProperty("--mag-y", "0px");
        currentMagnet = magnet;
      }
      if (magnet) {
        const rect = magnet.getBoundingClientRect();
        magnet.style.setProperty(
          "--mag-x",
          `${((event.clientX - rect.left) / rect.width - 0.5) * 9}px`,
        );
        magnet.style.setProperty(
          "--mag-y",
          `${((event.clientY - rect.top) / rect.height - 0.5) * 9}px`,
        );
      }

      const tiltTarget =
        (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tiltTarget !== currentTilt) {
        resetTilt(currentTilt);
        currentTilt = tiltTarget;
      }
      if (currentTilt) {
        const rect = currentTilt.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        currentTilt.style.setProperty("--tilt-x", `${(0.5 - y) * 9}deg`);
        currentTilt.style.setProperty("--tilt-y", `${(x - 0.5) * 12}deg`);
        currentTilt.style.setProperty("--glare-x", `${x * 100}%`);
        currentTilt.style.setProperty("--glare-y", `${y * 100}%`);
        currentTilt.classList.add("is-tilting");
      }

      const liquidTargetElement = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-liquid]",
      );
      if (liquidTargetElement) {
        if (currentLiquid !== liquidTargetElement) {
          currentLiquid?.classList.remove("is-liquid-active");
          currentLiquid = liquidTargetElement;
          currentLiquid.classList.add("is-liquid-active");
        }
        const delta = Math.hypot(event.clientX - previousX, event.clientY - previousY);
        liquidTarget = Math.min(13, 5 + delta * 0.3);
        turbulence.setAttribute(
          "baseFrequency",
          `${(0.009 + (event.clientX / window.innerWidth) * 0.008).toFixed(3)} 0.04`,
        );
        if (!animationFrame) animationFrame = window.requestAnimationFrame(updateLiquid);
      } else if (liquidTarget !== 0) {
        currentLiquid?.classList.remove("is-liquid-active");
        currentLiquid = null;
        liquidTarget = 0;
        if (!animationFrame) animationFrame = window.requestAnimationFrame(updateLiquid);
      } else {
        currentLiquid?.classList.remove("is-liquid-active");
        currentLiquid = null;
      }

      previousX = event.clientX;
      previousY = event.clientY;
    };

    const onLeave = () => {
      cursor.classList.remove("is-ready", "is-active");
      currentTarget = null;
      currentMagnet?.style.setProperty("--mag-x", "0px");
      currentMagnet?.style.setProperty("--mag-y", "0px");
      currentMagnet = null;
      resetTilt(currentTilt);
      currentTilt = null;
      currentLiquid?.classList.remove("is-liquid-active");
      currentLiquid = null;
      liquidTarget = 0;
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateLiquid);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      currentMagnet?.style.removeProperty("--mag-x");
      currentMagnet?.style.removeProperty("--mag-y");
      resetTilt(currentTilt);
      currentLiquid?.classList.remove("is-liquid-active");
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [reducedMotion]);

  return (
    <>
      <LiquidFilter />
      <CustomCursor />
      {showLoader && <IntroLoader onComplete={finishLoader} />}
    </>
  );
}
