import { PageHeader } from "@afterhive/ui";
import type { ReactNode } from "react";

type PlatformPageFrameProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PlatformPageFrame({ title, subtitle, actions, children }: PlatformPageFrameProps) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {children}
    </>
  );
}
