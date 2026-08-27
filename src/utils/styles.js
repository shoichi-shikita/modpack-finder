// Minecraft-UI style beveled edges (light top-left, dark bottom-right).
// Used as inline styles so they compose with Tailwind utility classes.
export const bevelOut = {
  boxShadow:
    "inset -3px -3px 0 rgba(0,0,0,0.45), inset 3px 3px 0 rgba(255,255,255,0.12)",
};

export const bevelIn = {
  boxShadow:
    "inset 3px 3px 0 rgba(0,0,0,0.55), inset -2px -2px 0 rgba(255,255,255,0.06)",
};