import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import bizdevImg from "./assets/images/bizdev-team.jpg";
import networkImg from "./assets/images/network-team.jpg";
import peopleImg from "./assets/images/people-team.jpg";
import seedlingsImg from "./assets/images/seedlings.jpg";
import farmingImg from "./assets/images/farming.jpg";
import officeImg from "./assets/images/office.jpg";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------
   Smooth scroll (Lenis) wired to ScrollTrigger + GSAP ticker
   ------------------------------------------------------------------ */
const lenis = new Lenis({
  duration: 1.05,
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
   Nav: hide-on-scroll-down + full menu toggle
   ------------------------------------------------------------------ */
const nav = document.getElementById("siteNav");
let lastY = window.scrollY;
ScrollTrigger.create({
  start: 80,
  onUpdate: (self) => {
    const y = self.scroll();
    if (y > lastY && y > 200) nav.classList.add("is-hidden");
    else nav.classList.remove("is-hidden");
    lastY = y;
  },
});

const menuBtn = document.getElementById("menuBtn");
const fullMenu = document.getElementById("fullMenu");
menuBtn.addEventListener("click", () => {
  menuBtn.classList.toggle("is-open");
  fullMenu.classList.toggle("is-open");
});
fullMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  menuBtn.classList.remove("is-open");
  fullMenu.classList.remove("is-open");
}));

/* ------------------------------------------------------------------
   Smooth in-page anchor navigation (nav, footer, hero cards, CTAs)
   ------------------------------------------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#" || id === "#top") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -20, duration: 1.3 });
  });
});

/* ------------------------------------------------------------------
   Hero — gentle parallax + intro reveal (no pin, matches reference restraint)
   ------------------------------------------------------------------ */
gsap.to("#heroImg", {
  yPercent: 8,
  ease: "none",
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
});
gsap.timeline({ delay: .2 })
  .from(".hero__strapline, .hero__statement, .hero__cta", { opacity: 0, y: 20, duration: .9, ease: "power3.out", stagger: .12 })
  .from(".hero__cards .hcard, .hero__cards .hpill", { opacity: 0, y: 18, duration: .7, ease: "power3.out", stagger: .07 }, "-=.6")
  .from(".hero__word", { opacity: 0, y: 30, duration: 1, ease: "power3.out" }, "-=.5");

/* ------------------------------------------------------------------
   Hero cards — cycle through sections with shifting content
   (images imported above so Vite fingerprints them correctly in prod)
   ------------------------------------------------------------------ */
function startCardRotation({ link, img, label, desc }, states, intervalMs, startDelayMs = 0) {
  if (!link) return;
  let stateIndex = 0;
  const apply = (s, animate) => {
    const targets = [img, label, desc].filter(Boolean);
    const show = () => {
      img.src = s.img;
      if (label) label.textContent = s.label;
      if (desc) desc.textContent = s.desc;
      link.setAttribute("href", s.href);
      if (animate) gsap.to(targets, { opacity: 1, duration: .5, ease: "power2.out" });
    };
    if (animate) {
      gsap.to(targets, { opacity: 0, duration: .35, ease: "power2.in", onComplete: show });
    } else {
      show();
    }
  };
  setTimeout(() => {
    setInterval(() => {
      stateIndex = (stateIndex + 1) % states.length;
      apply(states[stateIndex], true);
    }, intervalMs);
  }, startDelayMs);
}

const heroFeatureStates = [
  { img: bizdevImg, label: "What We Do", desc: "Business development, finance, technology and policy — one ecosystem.", href: "#work" },
  { img: networkImg, label: "Who We Work With", desc: "Cooperatives, youth, institutions and partners.", href: "#network" },
  { img: peopleImg, label: "People First", desc: "Real transformation, carried by real people.", href: "#people" },
];
startCardRotation({
  link: document.getElementById("heroFeature"),
  img: document.getElementById("heroFeatureImg"),
  label: document.getElementById("heroFeatureLabel"),
  desc: document.getElementById("heroFeatureDesc"),
}, heroFeatureStates, 4200);

const heroPhotoStates = [
  { img: seedlingsImg, label: "Growing Green", href: "#ventures" },
  { img: farmingImg, label: "In The Field", href: "#wwd-financing" },
  { img: officeImg, label: "Digital Tools", href: "#wwd-ict" },
];
startCardRotation({
  link: document.getElementById("heroPhotoCard"),
  img: document.getElementById("heroPhotoCardImg"),
  label: document.getElementById("heroPhotoCardLabel"),
}, heroPhotoStates, 3800, 1400);

/* ------------------------------------------------------------------
   Generic reveal-up
   ------------------------------------------------------------------ */
gsap.utils.toArray(".section-head, .eco-card, .numbers__cell, .people__circle, .people__pill, .people h2, .people p").forEach((el) => {
  gsap.fromTo(el, { opacity: 0, y: 26 }, {
    opacity: 1, y: 0, duration: .8, ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 88%" },
  });
});
gsap.utils.toArray(".vtile").forEach((el, i) => {
  gsap.fromTo(el, { opacity: 0, y: 22 }, {
    opacity: 1, y: 0, duration: .6, ease: "power2.out", delay: (i % 4) * 0.05,
    scrollTrigger: { trigger: el, start: "top 92%" },
  });
});

/* ------------------------------------------------------------------
   Ecosystem — build + animate radial diagram
   ------------------------------------------------------------------ */
const NODES = ["People", "Cooperatives", "Enterprise", "Finance", "Technology", "Knowledge", "Networks", "Policy", "Environment"];
const NODE_COLORS = ["#e71e25", "#a9702f", "#1c2b3a", "#244a37"];
const diagramEl = document.getElementById("ecosystemDiagram");

if (diagramEl) {
  const size = 560;
  const cx = size / 2, cy = size / 2, radius = size * 0.36, nodeR = 8;
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

  const lineGroup = document.createElementNS(ns, "g");
  const nodeGroup = document.createElementNS(ns, "g");

  const centerCircle = document.createElementNS(ns, "circle");
  centerCircle.setAttribute("cx", cx); centerCircle.setAttribute("cy", cy);
  centerCircle.setAttribute("r", size * 0.095); centerCircle.setAttribute("class", "eco-center-circle");
  const centerLabel = document.createElementNS(ns, "text");
  centerLabel.setAttribute("x", cx); centerLabel.setAttribute("y", cy + 5);
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
    node.setAttribute("r", nodeR); node.setAttribute("fill", NODE_COLORS[i % NODE_COLORS.length]);
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

  gsap.timeline({ scrollTrigger: { trigger: diagramEl, start: "top 75%" } })
    .to([centerCircle, centerLabel], { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.8)" })
    .to(lineEls, { scaleX: 1, duration: 0.6, ease: "power2.out", stagger: 0.06 }, "-=0.2")
    .to(nodeEls, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.05 }, "-=0.5");
}

/* ------------------------------------------------------------------
   What We Do — sticky list drives crossfading visual panel
   ------------------------------------------------------------------ */
const wwdItems = gsap.utils.toArray(".wwd__item");
const wwdPanels = gsap.utils.toArray(".wwd__panel");

wwdItems.forEach((item, i) => {
  ScrollTrigger.create({
    trigger: item,
    start: "top center",
    end: "bottom center",
    onToggle: (self) => {
      if (!self.isActive) return;
      wwdItems.forEach((el, j) => el.classList.toggle("is-active", j === i));
      wwdPanels.forEach((el, j) => el.classList.toggle("is-active", j === i));
    },
  });
});

/* ------------------------------------------------------------------
   Who We Work With — accordion
   ------------------------------------------------------------------ */
document.querySelectorAll(".acc-group__head").forEach((btn) => {
  btn.addEventListener("click", () => {
    const group = btn.closest(".acc-group");
    const wasOpen = group.classList.contains("is-open");
    document.querySelectorAll(".acc-group").forEach((g) => g.classList.remove("is-open"));
    if (!wasOpen) group.classList.add("is-open");
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
    gsap.to(el, { x: x * 0.03, y: y * 0.06, duration: 0.4, ease: "power3.out" });
  });
  el.addEventListener("mouseleave", () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  });
});

/* ------------------------------------------------------------------ */
ScrollTrigger.refresh();
