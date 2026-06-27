"use client";

import { Panel } from "./Panel";
import { Box, Typography } from "@mui/material";

export type StatCardTone = "default" | "success" | "warning" | "error" | "info";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: StatCardTone;
};

function resolveHintColor(tone: StatCardTone) {
  switch (tone) {
    case "default":
      return "text.secondary";
    case "success":
      return "success.main";
    case "warning":
      return "warning.main";
    case "error":
      return "error.main";
    case "info":
      return "info.main";
    default: {
      const exhaustiveCheck: never = tone;
      return exhaustiveCheck;
    }
  }
}

export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  return (
    <Panel>
      <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h4" component="p" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
        {value}
      </Typography>
      {hint ? (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ color: resolveHintColor(tone) }}>
            {hint}
          </Typography>
        </Box>
      ) : null}
    </Panel>
  );
}
