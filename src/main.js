import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------
   Smooth scroll (Lenis) wired to ScrollTrigger + GSAP ticker
   ------------------------------------------------------------------ */
const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ------------------------------------------------------------------
   Scroll progress rail
   ------------------------------------------------------------------ */
const progressFill = document.getElementById("progressFill");
ScrollTrigger.create({
  start: 0,
  end: () => document.documentElement.scrollHeight - window.innerHeight,
  onUpdate: (self) => { progressFill.style.width = `${self.progress * 100}%`; },
});

/* ------------------------------------------------------------------
   Nav: solid background + hide-on-scroll-down
   ------------------------------------------------------------------ */
const nav = document.getElementById("siteNav");
const heroEl = document.getElementById("hero");
let lastY = window.scrollY;

ScrollTrigger.create({
  trigger: heroEl,
  start: "bottom top+=120",
  onEnter: () => nav.classList.add("is-solid"),
  onLeaveBack: () => nav.classList.remove("is-solid"),
});

ScrollTrigger.create({
  start: 80,
  onUpdate: (self) => {
    const y = self.scroll();
    if (y > lastY && y > 200) nav.classList.add("is-hidden");
    else nav.classList.remove("is-hidden");
    lastY = y;
  },
});

const navBurger = document.getElementById("navBurger");
const mobileMenu = document.getElementById("mobileMenu");
navBurger.addEventListener("click", () => {
  mobileMenu.classList.toggle("is-open");
});
mobileMenu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => mobileMenu.classList.remove("is-open"))
);

/* ------------------------------------------------------------------
   Hero intro timeline
   ------------------------------------------------------------------ */
const heroTl = gsap.timeline({ delay: 0.2 });
heroTl
  .to(".hero__headline .line-inner", {
    y: "0%",
    duration: 1.1,
    ease: "expo.out",
    stagger: 0.12,
  })
  .to("[data-delay]", {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.12,
  }, "-=0.7");

gsap.set("[data-delay]", { y: 16 });

// hero parallax + fade on scroll out
gsap.to("#heroBg img", {
  yPercent: 14,
  ease: "none",
  scrollTrigger: { trigger: heroEl, start: "top top", end: "bottom top", scrub: true },
});
gsap.to(".hero__content, .hero__scroll", {
  opacity: 0,
  y: -40,
  ease: "none",
  scrollTrigger: { trigger: heroEl, start: "20% top", end: "bottom top", scrub: true },
});

/* ------------------------------------------------------------------
   Generic reveal-up (non-hero) elements
   ------------------------------------------------------------------ */
gsap.utils.toArray(".pull-quote, .ecosystem__text > *, .people__copy > *, .network > *").forEach((el) => {
  gsap.fromTo(el, { opacity: 0, y: 28 }, {
    opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 88%" },
  });
});

/* ------------------------------------------------------------------
   Values ticker — continuous marquee
   ------------------------------------------------------------------ */
function loopMarquee(selector, duration, direction = -1) {
  const track = document.querySelector(selector);
  if (!track) return;
  const width = track.scrollWidth / 2;
  gsap.fromTo(track, { x: direction < 0 ? 0 : -width }, {
    x: direction < 0 ? -width : 0,
    duration, ease: "none", repeat: -1,
  });
}
loopMarquee("#tickerTrack", 22, -1);
document.querySelectorAll(".ventures__row--a .ventures__track").forEach((t) => {
  gsap.fromTo(t, { x: 0 }, { x: -t.scrollWidth / 2, duration: 42, ease: "none", repeat: -1 });
});
document.querySelectorAll(".ventures__row--b .ventures__track").forEach((t) => {
  gsap.fromTo(t, { x: -t.scrollWidth / 2 }, { x: 0, duration: 46, ease: "none", repeat: -1 });
});

/* ------------------------------------------------------------------
   Idea section — scroll-scrubbed word reveal
   ------------------------------------------------------------------ */
const scrubEl = document.getElementById("scrubText");
if (scrubEl) {
  const words = scrubEl.textContent.trim().split(/\s+/);
  scrubEl.innerHTML = words.map((w) => `<span class="word">${w}</span>`).join(" ");
  const wordEls = scrubEl.querySelectorAll(".word");

  ScrollTrigger.create({
    trigger: scrubEl,
    start: "top 75%",
    end: "bottom 40%",
    scrub: true,
    onUpdate: (self) => {
      const litCount = Math.floor(self.progress * wordEls.length);
      wordEls.forEach((w, i) => w.classList.toggle("is-lit", i < litCount));
    },
  });
}

/* ------------------------------------------------------------------
   Ecosystem — build + animate radial diagram
   ------------------------------------------------------------------ */
const NODES = ["People", "Cooperatives", "Enterprise", "Finance", "Technology", "Knowledge", "Networks", "Policy", "Environment"];
const legendEl = document.getElementById("ecosystemLegend");
const diagramEl = document.getElementById("ecosystemDiagram");

if (legendEl && diagramEl) {
  legendEl.innerHTML = NODES.map((n) => `<li>${n}</li>`).join("");

  const size = 560;
  const cx = size / 2, cy = size / 2, radius = size * 0.36, nodeR = 8;
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

  const lineGroup = document.createElementNS(ns, "g");
  const nodeGroup = document.createElementNS(ns, "g");

  const centerCircle = document.createElementNS(ns, "circle");
  centerCircle.setAttribute("cx", cx); centerCircle.setAttribute("cy", cy);
  centerCircle.setAttribute("r", size * 0.1); centerCircle.setAttribute("class", "eco-center-circle");
  const centerLabel = document.createElementNS(ns, "text");
  centerLabel.setAttribute("x", cx); centerLabel.setAttribute("y", cy + 7);
  centerLabel.setAttribute("text-anchor", "middle"); centerLabel.setAttribute("class", "eco-center-label");
  centerLabel.textContent = "TUI";

  const nodeEls = [];
  const lineEls = [];

  NODES.forEach((label, i) => {
    const angle = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", cx); line.setAttribute("y1", cy);
    line.setAttribute("x2", x); line.setAttribute("y2", y);
    line.setAttribute("class", "eco-line");
    lineGroup.appendChild(line);
    lineEls.push(line);

    const node = document.createElementNS(ns, "circle");
    node.setAttribute("cx", x); node.setAttribute("cy", y);
    node.setAttribute("r", nodeR); node.setAttribute("class", "eco-node-circle");
    nodeGroup.appendChild(node);

    const label_ = document.createElementNS(ns, "text");
    const labelOffset = Math.cos(angle) >= 0 ? 16 : -16;
    label_.setAttribute("x", x + labelOffset);
    label_.setAttribute("y", y + 4);
    label_.setAttribute("text-anchor", Math.cos(angle) >= 0 ? "start" : "end");
    label_.setAttribute("class", "eco-node-label");
    label_.textContent = label;
    nodeGroup.appendChild(label_);

    nodeEls.push(node, label_);
  });

  svg.appendChild(lineGroup);
  svg.appendChild(nodeGroup);
  svg.appendChild(centerCircle);
  svg.appendChild(centerLabel);
  diagramEl.appendChild(svg);

  gsap.set(lineEls, { scaleX: 0, transformOrigin: "0% 0%" });
  gsap.set(nodeEls, { opacity: 0, scale: 0, transformOrigin: "center" });
  gsap.set([centerCircle, centerLabel], { opacity: 0, scale: 0.7, transformOrigin: "center" });

  const ecoTl = gsap.timeline({
    scrollTrigger: { trigger: diagramEl, start: "top 75%" },
  });
  ecoTl
    .to([centerCircle, centerLabel], { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.8)" })
    .to(lineEls, { scaleX: 1, duration: 0.6, ease: "power2.out", stagger: 0.06 }, "-=0.2")
    .to(nodeEls, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.05 }, "-=0.5")
    .to("#ecosystemLegend li", { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }, "-=0.6");
}

/* ------------------------------------------------------------------
   Four Core Areas — pinned horizontal scroll (desktop only)
   ------------------------------------------------------------------ */
const workTrack = document.getElementById("workTrack");
const workPin = document.getElementById("workPin");

const mm = gsap.matchMedia();

mm.add("(min-width: 981px)", () => {
  const getScrollAmount = () => workTrack.scrollWidth - window.innerWidth + 80;

  const tween = gsap.to(workTrack, {
    x: () => -getScrollAmount(),
    ease: "none",
    scrollTrigger: {
      trigger: workPin,
      start: "top top",
      end: () => `+=${getScrollAmount()}`,
      scrub: 1,
      pin: true,
      invalidateOnRefresh: true,
    },
  });

  gsap.utils.toArray("[data-panel]").forEach((panel) => {
    gsap.fromTo(panel, { opacity: 0.35, y: 30 }, {
      opacity: 1, y: 0, ease: "power2.out",
      scrollTrigger: {
        trigger: panel,
        containerAnimation: tween.scrollTrigger.animation,
        start: "left 85%",
        end: "left 55%",
        scrub: true,
      },
    });
  });

  return () => tween.scrollTrigger && tween.scrollTrigger.kill();
});

/* ------------------------------------------------------------------
   People — clip-path image reveal
   ------------------------------------------------------------------ */
const peopleClip = document.querySelector(".people__clip");
if (peopleClip) {
  gsap.fromTo(peopleClip, { clipPath: "inset(0 0 0 100%)" }, {
    clipPath: "inset(0 0 0 0%)",
    duration: 1.3,
    ease: "power4.out",
    scrollTrigger: { trigger: peopleClip, start: "top 80%" },
  });
}

/* ------------------------------------------------------------------
   Network grid — staggered reveal
   ------------------------------------------------------------------ */
gsap.set(".network__grid li", { opacity: 0, y: 20 });
gsap.to(".network__grid li", {
  opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "power2.out",
  scrollTrigger: { trigger: ".network__grid", start: "top 85%" },
});

/* ------------------------------------------------------------------
   Closing section reveal
   ------------------------------------------------------------------ */
gsap.utils.toArray(".closing > *:not(.closing__bg)").forEach((el, i) => {
  gsap.fromTo(el, { opacity: 0, y: 24 }, {
    opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: i * 0.05,
    scrollTrigger: { trigger: ".closing", start: "top 70%" },
  });
});

/* ------------------------------------------------------------------
   Magnetic buttons
   ------------------------------------------------------------------ */
document.querySelectorAll(".magnetic").forEach((el) => {
  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    gsap.to(el, { x: x * 0.35, y: y * 0.5, duration: 0.4, ease: "power3.out" });
  });
  el.addEventListener("mouseleave", () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  });
});

/* ------------------------------------------------------------------ */
ScrollTrigger.refresh();
