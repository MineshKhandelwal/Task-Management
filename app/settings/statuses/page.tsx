"use client";

import React, { useState } from "react";
import { SettingsBreadcrumb, PageHeader } from "@/components/layout";
import { useGetStatusesQuery, StatusItem } from "@/store/services/statusesApi";
import StatusList from "@/components/status/StatusList";
import WorkflowRulesSidebar from "@/components/status/WorkflowRulesSidebar";
import StatusFormModal from "@/components/status/StatusFormModal";
import StatusDeleteDialog from "@/components/status/StatusDeleteDialog";

export default function StatusesSettingsPage() {
  const { data: statuses } = useGetStatusesQuery();
  const statusList = statuses || [];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusToEdit, setStatusToEdit] = useState<StatusItem | null>(null);
  const [statusToDelete, setStatusToDelete] = useState<StatusItem | null>(null);

  const nextOrder =
    statusList.length > 0
      ? Math.max(...statusList.map((s) => s.order)) + 1
      : 0;

  return (
    <>
      <SettingsBreadcrumb currentSection="Statuses" />

      <PageHeader
        title="Statuses"
        badge={`${statusList.length} ACTIVE`}
        actionLabel="NEW STATUS"
        onAction={() => setIsCreateOpen(true)}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gap: "var(--space-lg)",
          alignItems: "start",
        }}
      >
        <div style={{ gridColumn: "span 12" }} className="lg-col-span-9">
          <style jsx>{`
            @media (min-width: 1024px) {
              .lg-col-span-9 {
                grid-column: span 9 / span 9 !important;
              }
              .lg-col-span-3 {
                grid-column: span 3 / span 3 !important;
              }
            }
          `}</style>
          <StatusList
            onEditStatus={(status) => setStatusToEdit(status)}
            onDeleteStatus={(status) => setStatusToDelete(status)}
          />
        </div>

        <div style={{ gridColumn: "span 12" }} className="lg-col-span-3">
          <WorkflowRulesSidebar statuses={statusList} />
        </div>
      </div>

      {/* Create Status Modal */}
      <StatusFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        nextOrder={nextOrder}
      />

      {/* Edit Status Modal */}
      {statusToEdit && (
        <StatusFormModal
          isOpen={!!statusToEdit}
          onClose={() => setStatusToEdit(null)}
          statusToEdit={statusToEdit}
        />
      )}

      {/* Delete Status Confirmation / Reassignment Dialog */}
      {statusToDelete && (
        <StatusDeleteDialog
          isOpen={!!statusToDelete}
          onClose={() => setStatusToDelete(null)}
          statusToDelete={statusToDelete}
          availableStatuses={statusList}
        />
      )}
    </>
  );
}
