"use client";

import { afterhiveLayout } from "../theme/design-tokens";
import type { AdminAppShellProps } from "./admin-app-shell-types";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  OutlinedInput,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import ImportExportOutlinedIcon from "@mui/icons-material/ImportExportOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import type { ReactElement } from "react";

const navIconMatchers: Array<{ pattern: RegExp; icon: ReactElement }> = [
  { pattern: /\/$/, icon: <DashboardOutlinedIcon fontSize="small" /> },
  { pattern: /leads/, icon: <PeopleOutlineOutlinedIcon fontSize="small" /> },
  { pattern: /persons/, icon: <GroupsOutlinedIcon fontSize="small" /> },
  { pattern: /import/, icon: <ImportExportOutlinedIcon fontSize="small" /> },
  { pattern: /documents/, icon: <FolderOutlinedIcon fontSize="small" /> },
  { pattern: /offers/, icon: <LocalOfferOutlinedIcon fontSize="small" /> },
  { pattern: /sessions/, icon: <EventOutlinedIcon fontSize="small" /> },
  { pattern: /club/, icon: <SportsSoccerOutlinedIcon fontSize="small" /> },
  { pattern: /billing|invoices|contracts|dunning/, icon: <PaidOutlinedIcon fontSize="small" /> },
  { pattern: /messages/, icon: <MailOutlineOutlinedIcon fontSize="small" /> },
  { pattern: /settings|locations|team/, icon: <SettingsOutlinedIcon fontSize="small" /> },
];

function resolveNavIcon(href: string) {
  const match = navIconMatchers.find((entry) => entry.pattern.test(href));

  if (match) {
    return match.icon;
  }

  return <DashboardOutlinedIcon fontSize="small" />;
}

function isNavItemActive(currentPath: string, href: string) {
  if (href.endsWith("/") || href.split("/").filter(Boolean).length <= 2) {
    return currentPath === href || currentPath === href.replace(/\/$/, "");
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function AdminAppShell({
  tenantName,
  breadcrumb,
  searchPlaceholder,
  surfaceLabel,
  userName,
  userRole,
  userInitials,
  navSections,
  currentPath,
  hrefPrefix = "",
  children,
}: AdminAppShellProps) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: afterhiveLayout.drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: afterhiveLayout.drawerWidth,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box sx={{ px: 2.5, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          >
            A
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Afterhive
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {surfaceLabel}
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ px: 2.5, pb: 1 }}>
          {tenantName}
        </Typography>

        <Box sx={{ flex: 1, overflowY: "auto", pb: 2 }}>
          {navSections.map((section) => (
            <List
              key={section.title}
              subheader={<ListSubheader disableSticky>{section.title}</ListSubheader>}
              sx={{ py: 0 }}
            >
              {section.items.map((item) => {
                const selected = isNavItemActive(currentPath, item.href);

                return (
                  <ListItemButton
                    key={item.href}
                    component="a"
                    href={`${hrefPrefix}${item.href}`}
                    selected={selected}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>{resolveNavIcon(item.href)}</ListItemIcon>
                    <ListItemText primary={item.label} />
                    {item.badge !== undefined ? (
                      <Badge
                        badgeContent={item.badge}
                        color="primary"
                        sx={{
                          "& .MuiBadge-badge": {
                            position: "static",
                            transform: "none",
                            minWidth: 24,
                            height: 20,
                            borderRadius: 999,
                            fontSize: "0.6875rem",
                          },
                        }}
                      />
                    ) : null}
                  </ListItemButton>
                );
              })}
            </List>
          ))}
        </Box>

        <Box sx={{ px: 2, py: 2, borderTop: 1, borderColor: "divider", display: "flex", gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", color: "primary.contrastText" }}>
            {userInitials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {userName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {userRole}
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar position="sticky" color="transparent" elevation={0}>
          <Toolbar sx={{ gap: 2, minHeight: afterhiveLayout.topbarHeight }}>
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
              {breadcrumb}
            </Typography>
            <OutlinedInput
              placeholder={searchPlaceholder}
              size="small"
              sx={{ flex: 1, maxWidth: 560, mx: "auto" }}
              startAdornment={
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <Typography variant="caption" color="text.secondary">
                    ⌘K
                  </Typography>
                </InputAdornment>
              }
            />
            <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
              <IconButton size="small" aria-label="notifications">
                <NotificationsNoneOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="help">
                <HelpOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, p: `${afterhiveLayout.contentPadding}px` }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
