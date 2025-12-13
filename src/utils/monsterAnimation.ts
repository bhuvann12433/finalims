// ---------------------------------------------
// FIXED & CLEANED MONSTER ANIMATION
// ---------------------------------------------
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(MorphSVGPlugin);

export function initMonsterAnimation(refs = {}) {
  const {
    svgContainer,
    emailInput,
    passwordInput,
    showPasswordCheck,
    eyeL,
    eyeR,
    nose,
    mouth,
    mouthBG,
    mouthSmallBG,
    mouthMediumBG,
    mouthLargeBG,
    mouthMaskPath,
    mouthOutline,
    chin,
    armL,
    armR,
    twoFingers,
  } = refs;

  if (!svgContainer || !emailInput || !passwordInput) {
    console.warn("MonsterAnimation: Missing required refs.");
    return () => {};
  }

  // 🔥 IMPORTANT FIX — Prevent animation from stealing focus or clearing text
  passwordInput.addEventListener("mousedown", (e) => e.stopPropagation());
  emailInput.addEventListener("mousedown", (e) => e.stopPropagation());

  // ----------------------------------------------------
  // SAFE MOUTH MORPHING
  // ----------------------------------------------------
  const safePath = (node) => {
    if (!node) return mouthBG.getAttribute("d");
    const d = node.getAttribute("d");
    if (!d || d.includes("...")) return mouthBG.getAttribute("d");
    return d;
  };

  const smallD = safePath(mouthSmallBG);
  const medD = safePath(mouthMediumBG);
  const largeD = safePath(mouthLargeBG);
  const maskD = safePath(mouthMaskPath);

  // Update invalid `d` values
  const ensureD = (node, d) => {
    if (!node) return;
    const dd = node.getAttribute("d");
    if (!dd || dd.includes("...")) node.setAttribute("d", d);
  };
  ensureD(mouthSmallBG, smallD);
  ensureD(mouthMediumBG, medD);
  ensureD(mouthLargeBG, largeD);
  ensureD(mouthMaskPath, maskD);

  // ----------------------------------------------------
  // FACE REACTION TO INPUT
  // ----------------------------------------------------
  function calculateFaceMove() {
    const caret = emailInput.selectionStart || 0;

    const div = document.createElement("div");
    const span = document.createElement("span");
    const style = getComputedStyle(emailInput);

    Array.from(style).forEach((prop) => (div.style[prop] = style[prop]));
    div.style.position = "absolute";
    div.style.whiteSpace = "pre-wrap";
    div.style.visibility = "hidden";

    div.textContent = emailInput.value.substring(0, caret);
    span.textContent = emailInput.value.substring(caret) || ".";
    div.appendChild(span);
    document.body.appendChild(div);

    const r = svgContainer.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();

    const target = {
      x: spanRect.left,
      y: spanRect.top + 25,
    };

    const parts = [
      { el: eyeL, multX: 20, multY: 10 },
      { el: eyeR, multX: 20, multY: 10 },
      { el: nose, multX: 23, multY: 10 },
      { el: mouth, multX: 23, multY: 10 },
      { el: chin, multX: 18, multY: 6 },
    ];

    parts.forEach(({ el, multX, multY }) => {
      if (!el) return;
      const box = el.getBoundingClientRect();
      const angle = Math.atan2(box.y - target.y, box.x - target.x);
      const x = Math.cos(angle) * multX;
      const y = Math.sin(angle) * multY;
      gsap.to(el, { x: -x, y: -y, duration: 0.8, ease: "expo.out" });
    });

    document.body.removeChild(div);
  }

  function onEmailInput() {
    calculateFaceMove();
    const v = emailInput.value;

    if (v.includes("@")) {
      gsap.to([mouthBG, mouthOutline, mouthMaskPath], {
        morphSVG: largeD,
        duration: 0.8,
        ease: "expo.out",
      });
      gsap.to([eyeL, eyeR], { scale: 0.7, duration: 0.8, ease: "expo.out" });
    } else if (v.length > 0) {
      gsap.to([mouthBG, mouthOutline, mouthMaskPath], {
        morphSVG: medD,
        duration: 0.8,
        ease: "expo.out",
      });
      gsap.to([eyeL, eyeR], { scale: 0.85, duration: 0.8, ease: "expo.out" });
    } else {
      gsap.to([mouthBG, mouthOutline, mouthMaskPath], {
        morphSVG: smallD,
        duration: 0.8,
        ease: "expo.out",
      });
      gsap.to([eyeL, eyeR], { scale: 1, duration: 0.8, ease: "expo.out" });
    }
  }

  emailInput.addEventListener("input", onEmailInput);

  // ----------------------------------------------------
  // FIX: REMOVED coverEyes() + uncoverEyes()
  // They were causing focus loss => password reset => bcrypt mismatch
  // ----------------------------------------------------

  /*
  ❌ DO NOT ENABLE THESE — they break password field
  passwordInput.addEventListener("focus", coverEyes);
  passwordInput.addEventListener("blur", uncoverEyes);
  */

  // ----------------------------------------------------
  // SHOW PASSWORD (SAFE VERSION)
  // ----------------------------------------------------
  function showChangeHandler(e) {
    const checked = e.target.checked;

    // FIX: change type without triggering focus loss
    requestAnimationFrame(() => {
      passwordInput.type = checked ? "text" : "password";
    });

    if (checked) {
      gsap.to(twoFingers, { rotation: 30, x: -9, y: -2, duration: 0.35 });
    } else {
      gsap.to(twoFingers, { rotation: 0, x: 0, y: 0, duration: 0.35 });
    }
  }

  if (showPasswordCheck) {
    showPasswordCheck.addEventListener("change", showChangeHandler);
  }

  return () => {
    emailInput.removeEventListener("input", onEmailInput);
    if (showPasswordCheck)
      showPasswordCheck.removeEventListener("change", showChangeHandler);
    gsap.killTweensOf("*");
  };
}
