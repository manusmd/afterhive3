"use client";

import type { SurfaceTheme } from "../theme";
import { Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";

type SurfaceShellProps = {
  surface: SurfaceTheme;
  title: string;
  children?: ReactNode;
};

const surfaceMaxWidth: Record<SurfaceTheme, false | "md" | "lg"> = {
  admin: false,
  platform: false,
  portal: "md",
  marketplace: "lg",
};

const surfacePadding: Record<SurfaceTheme, number> = {
  admin: 4,
  platform: 4,
  portal: 5,
  marketplace: 6,
};

export function SurfaceShell({ surface, title, children }: SurfaceShellProps) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container
        maxWidth={surfaceMaxWidth[surface]}
        sx={{ py: surfacePadding[surface] }}
      >
        <Typography variant="overline" color="text.secondary">
          Afterhive
        </Typography>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        {children}
      </Container>
    </Box>
  );
}
