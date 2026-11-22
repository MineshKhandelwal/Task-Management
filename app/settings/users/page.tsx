"use client";

import React, { useState } from "react";
import { SettingsBreadcrumb, PageHeader } from "@/components/layout";
import UsersTable from "@/components/user/UsersTable";
import UserFormModal from "@/components/user/UserFormModal";

export default function UsersSettingsPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <>
      <SettingsBreadcrumb currentSection="Users" />

      <PageHeader
        title="Users"
        badge="/settings/users"
        actionLabel="INVITE USER"
        onAction={() => setIsInviteOpen(true)}
      />

      <UsersTable />

      <UserFormModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </>
  );
}
