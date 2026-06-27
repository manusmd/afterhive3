"use client";

import { Stack } from "@mui/material";
import type { ReactNode } from "react";

type QuickActionBarProps = {
  children: ReactNode;
};

export function QuickActionBar({ children }: QuickActionBarProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 3 }} useFlexGap>
      {children}
    </Stack>
  );
}
