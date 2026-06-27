"use client";

import { afterhiveLayout } from "../theme/design-tokens";
import { Paper, type PaperProps } from "@mui/material";

type PanelProps = PaperProps;

export function Panel({ children, sx, ...props }: PanelProps) {
  return (
    <Paper
      {...props}
      sx={{
        p: `${afterhiveLayout.cardPadding}px`,
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}
