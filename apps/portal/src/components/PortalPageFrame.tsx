import { PageHeader } from "@afterhive/ui";
import type { ReactNode } from "react";

type PortalPageFrameProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PortalPageFrame({ title, subtitle, actions, children }: PortalPageFrameProps) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {children}
    </>
  );
}
