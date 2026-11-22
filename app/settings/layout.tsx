import React from "react";
import { PageShell } from "@/components/layout";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageShell currentPage="settings">{children}</PageShell>;
}
