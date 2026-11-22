// Deterministic color generation and validation utilities
// Palette aligns with Avatar.tsx and _stitch_export/taskflow/DESIGN.md

export const AVATAR_COLORS = [
  "#0f62fe", // primary-container
  "#006a68", // secondary
  "#2f3131", // inverse-surface
  "#9e3100", // tertiary
  "#004ccd", // primary
  "#00504e", // secondary variant
  "#832700", // tertiary variant
];

export function deriveAvatarColor(name: string): string {
  if (!name || typeof name !== "string") return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}
