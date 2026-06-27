"use client";

import { Chip, type ChipProps } from "@mui/material";

export type StatusChipTone = "neutral" | "success" | "warning" | "error" | "info";

type StatusChipProps = {
  label: string;
  tone?: StatusChipTone;
} & Pick<ChipProps, "size">;

function resolveChipColor(tone: StatusChipTone): ChipProps["color"] {
  switch (tone) {
    case "neutral":
      return "default";
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "error":
      return "error";
    case "info":
      return "info";
    default: {
      const exhaustiveCheck: never = tone;
      return exhaustiveCheck;
    }
  }
}

export function StatusChip({ label, tone = "neutral", size = "small" }: StatusChipProps) {
  return <Chip label={label} size={size} color={resolveChipColor(tone)} variant="outlined" />;
}
