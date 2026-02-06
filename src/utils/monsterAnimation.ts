// src/utils/monsterAnimation.ts

type MonsterRefs = {
  svgContainer?: HTMLElement | null;
  emailInput?: HTMLInputElement | null;
  passwordInput?: HTMLInputElement | null;
  showPasswordCheck?: HTMLInputElement | null;

  eyeL?: SVGElement | null;
  eyeR?: SVGElement | null;
  mouth?: SVGElement | null;
  face?: SVGElement | null;
  armL?: SVGElement | null;
  armR?: SVGElement | null;
};

/**
 * SAFELY get SVG path data
 */
function safePath(el?: SVGElement | null) {
  if (!el) return "";
  return el.getAttribute("d") || "";
}

/**
 * INIT MONSTER ANIMATION (NULL SAFE)
 */
export function initMonsterAnimation(refs: MonsterRefs) {
  const {
    svgContainer,
    emailInput,
    passwordInput,
    showPasswordCheck,
    eyeL,
    eyeR,
    mouth,
    face,
    armL,
    armR,
  } = refs;

  // ❗ If SVG not loaded, STOP silently
  if (!svgContainer) {
    console.warn("MonsterSVG container not found – animation skipped");
    return;
  }

  // Safe path reads (no crash)
  safePath(eyeL);
  safePath(eyeR);
  safePath(mouth);
  safePath(face);
  safePath(armL);
  safePath(armR);

  // 👀 Focus email → eyes open
  emailInput?.addEventListener("focus", () => {
    eyeL?.classList.add("active");
    eyeR?.classList.add("active");
  });

  emailInput?.addEventListener("blur", () => {
    eyeL?.classList.remove("active");
    eyeR?.classList.remove("active");
  });

  // 🙈 Focus password → hide eyes
  passwordInput?.addEventListener("focus", () => {
    armL?.classList.add("cover-eyes");
    armR?.classList.add("cover-eyes");
  });

  passwordInput?.addEventListener("blur", () => {
    armL?.classList.remove("cover-eyes");
    armR?.classList.remove("cover-eyes");
  });

  // 👁 Show password checkbox
  showPasswordCheck?.addEventListener("change", () => {
    armL?.classList.remove("cover-eyes");
    armR?.classList.remove("cover-eyes");
  });
}
