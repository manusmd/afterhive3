"use client";

import { ListSubheader, Stack } from "@mui/material";
import type { ReactNode } from "react";

type NavSectionProps = {
  title: string;
  children: ReactNode;
};

export function NavSection({ title, children }: NavSectionProps) {
  return (
    <Stack component="section" spacing={0.5} sx={{ mb: 1 }}>
      <ListSubheader disableSticky component="div" sx={{ px: 0, lineHeight: 1.6 }}>
        {title}
      </ListSubheader>
      <Stack spacing={0.25}>{children}</Stack>
    </Stack>
  );
}
