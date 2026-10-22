import { MOTION_GROUPS, MotionPreferencesStore } from "../data/local/motionPreferencesStore.js";

// Slow-TV motion rules used to hang off .performance-constrained,
// .legacy-tizen and .legacy-webos, which also gate memory, loading and input
// policies. Motion rules now use one root class per origin and group
// (motion-constrained-focus, motion-tizen-transitions, ...). In Auto mode each
// class mirrors its origin, so behavior is unchanged; otherwise a reduced
// group sets every origin class and an enabled group sets none.
const MOTION_ORIGINS = Object.freeze(["constrained", "tizen", "webos"]);

let lastOrigins = {
  constrained: false,
  tizen: false,
  webos: false,
  noBackdropFilter: false
};

export function shouldReduceMotion(group, autoReduced) {
  const preferences = MotionPreferencesStore.get();
  if (preferences.mode === "full") {
    return false;
  }
  if (preferences.mode === "reduced") {
    return true;
  }
  const enabled = preferences.groups[group];
  if (preferences.mode !== "custom" || typeof enabled !== "boolean") {
    return Boolean(autoReduced);
  }
  return !enabled;
}

// What Auto would choose for a group on this TV. Settings shows it for groups
// that have no custom value yet.
export function isMotionAutoReduced(group) {
  if (group === "blur") {
    return lastOrigins.constrained;
  }
  return lastOrigins.constrained || lastOrigins.tizen || lastOrigins.webos;
}

export function applyMotionPresentation(origins = lastOrigins) {
  lastOrigins = { ...lastOrigins, ...origins };
  const root = globalThis.document?.documentElement;
  if (!root) {
    return;
  }
  MOTION_GROUPS.forEach((group) => {
    MOTION_ORIGINS.forEach((origin) => {
      root.classList.toggle(
        `motion-${origin}-${group}`,
        shouldReduceMotion(group, lastOrigins[origin])
      );
    });
  });
  const blurCapable =
    !lastOrigins.noBackdropFilter && !shouldReduceMotion("blur", lastOrigins.constrained);
  root.classList.toggle("modern-sidebar-blur-capable", blurCapable);
  globalThis.document.body?.classList.toggle("modern-sidebar-blur-capable", blurCapable);
}
