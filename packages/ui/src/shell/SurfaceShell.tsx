"use client";

import type { SurfaceTheme } from "@afterhive/ui/theme";
import { AppThemeProvider, getSurfaceTheme } from "@afterhive/ui";
import { Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";

type SurfaceShellProps = {
  surface: SurfaceTheme;
  title: string;
  children?: ReactNode;
};

export function SurfaceShell({ surface, title, children }: SurfaceShellProps) {
  const theme = getSurfaceTheme(surface);

  return (
    <AppThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Typography variant="overline" color="text.secondary">
            Afterhive
          </Typography>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          {children}
        </Container>
      </Box>
    </AppThemeProvider>
  );
}
