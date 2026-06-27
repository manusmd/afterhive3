import { PageHeader } from "@afterhive/ui";
import type { ReactNode } from "react";

type AdminPageFrameProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AdminPageFrame({ title, subtitle, actions, children }: AdminPageFrameProps) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {children}
    </>
  );
}
