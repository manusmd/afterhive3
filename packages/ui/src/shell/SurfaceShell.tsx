"use client";

import type { SurfaceTheme } from "../theme";
import { Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";

type SurfaceShellProps = {
  surface: SurfaceTheme;
  title: string;
  embedded?: boolean;
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

export function SurfaceShell({ surface, title, embedded = false, children }: SurfaceShellProps) {
  const content = (
    <>
      {!embedded ? (
        <Typography variant="overline" color="text.secondary">
          Afterhive
        </Typography>
      ) : null}
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      {children}
    </>
  );

  if (embedded) {
    return <Box>{content}</Box>;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container
        maxWidth={surfaceMaxWidth[surface]}
        sx={{ py: surfacePadding[surface] }}
      >
        {content}
      </Container>
    </Box>
  );
}
