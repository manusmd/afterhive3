import { PageHeader } from "@afterhive/ui";
import type { ReactNode } from "react";

type MarketplacePageFrameProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function MarketplacePageFrame({
  title,
  subtitle,
  actions,
  children,
}: MarketplacePageFrameProps) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {children}
    </>
  );
}
