import { LocalStore } from "../../core/storage/localStore.js";

// Motion cost depends on the TV hardware, not the viewer, so these
// preferences are device-local rather than profile-scoped.
const KEY = "motionPreferences";

export const MOTION_GROUPS = Object.freeze([
  "transitions",
  "hero",
  "focus",
  "scroll",
  "blur",
  "ambient"
]);

// auto follows runtime detection, full/reduced force every group, and custom
// uses the per-group switches.
export const MOTION_MODES = Object.freeze(["auto", "full", "reduced", "custom"]);

function readPreferences() {
  const value = LocalStore.get(KEY, {});
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizePreferences(value = {}) {
  const groups = {};
  MOTION_GROUPS.forEach((group) => {
    // Unset groups stay undefined so custom mode can fall back to Auto.
    if (typeof value.groups?.[group] === "boolean") {
      groups[group] = value.groups[group];
    }
  });
  return {
    mode: MOTION_MODES.includes(value.mode) ? value.mode : "auto",
    groups
  };
}

export const MotionPreferencesStore = {
  get() {
    return normalizePreferences(readPreferences());
  },

  set(partial = {}) {
    const current = this.get();
    const next = normalizePreferences({
      ...current,
      ...partial,
      groups: { ...current.groups, ...(partial.groups || {}) }
    });
    LocalStore.set(KEY, next);
    return next;
  }
};
