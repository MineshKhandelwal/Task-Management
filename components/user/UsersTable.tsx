"use client";

import React, { useState } from "react";
import { Avatar, ConfirmDialog, Spinner, EmptyState, useToast } from "@/components/ui";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  UserItem,
} from "@/store/services/usersApi";
import UserFormModal from "./UserFormModal";
import styles from "./UsersTable.module.scss";

export default function UsersTable() {
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const [userToEdit, setUserToEdit] = useState<UserItem | null>(null);
  const [userToDeactivate, setUserToDeactivate] = useState<UserItem | null>(null);

  const toast = useToast();
  const { data: users, isLoading, error } = useGetUsersQuery({ isActive: "all" });
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const allUsers = users || [];
  const activeUsers = allUsers.filter((u) => u.isActive);
  const inactiveUsers = allUsers.filter((u) => !u.isActive);

  const displayedUsers = activeTab === "active" ? activeUsers : inactiveUsers;

  const handleDeactivate = async () => {
    if (!userToDeactivate) return;
    try {
      await updateUser({
        id: userToDeactivate._id,
        data: { isActive: false },
      }).unwrap();
      toast.success(`User '${userToDeactivate.name}' has been deactivated.`);
      setUserToDeactivate(null);
    } catch {
      toast.error("Failed to deactivate user.");
    }
  };

  const handleReactivate = async (user: UserItem) => {
    try {
      await updateUser({
        id: user._id,
        data: { isActive: true },
      }).unwrap();
      toast.success(`User '${user.name}' has been reactivated.`);
    } catch {
      toast.error("Failed to reactivate user.");
    }
  };

  const getRoleClass = (role: string, isInactive: boolean) => {
    if (isInactive) return styles.inactiveRole;
    const lower = role.toLowerCase();
    if (lower.includes("admin")) return styles.admin;
    if (lower.includes("lead")) return styles.lead;
    if (lower.includes("product") || lower.includes("pm")) return styles.pm;
    return styles.defaultRole;
  };

  return (
    <div className={styles.container}>
      {/* Active / Inactive Tab Strip */}
      <div className={styles.tabList} role="tablist" aria-label="User status filter">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "active"}
          className={`${styles.tabBtn} ${activeTab === "active" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active ({activeUsers.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "inactive"}
          className={`${styles.tabBtn} ${activeTab === "inactive" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("inactive")}
        >
          Inactive ({inactiveUsers.length})
        </button>
      </div>

      {/* Table Shell */}
      <div className={styles.tableWrapper}>
        <div className={styles.table}>
          <div className={styles.headerRow}>
            <div className={styles.colAvatar}>Avatar</div>
            <div className={styles.colName}>Name</div>
            <div className={styles.colEmail}>Email</div>
            <div className={styles.colRole}>Role</div>
            <div className={styles.colActions}>Actions</div>
          </div>

          {isLoading ? (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
              <Spinner size="lg" />
            </div>
          ) : displayedUsers.length === 0 ? (
            <EmptyState
              title={`No ${activeTab} users found`}
              description={
                activeTab === "active"
                  ? "There are currently no active users in the system."
                  : "No users have been deactivated yet."
              }
            />
          ) : (
            displayedUsers.map((user) => {
              const isInactive = !user.isActive;
              return (
                <div
                  key={user._id}
                  className={`${styles.dataRow} ${isInactive ? styles.inactiveRow : ""}`}
                >
                  <div className={styles.colAvatar}>
                    <Avatar
                      name={user.name}
                      size="lg"
                      color={user.avatarColor}
                      inactive={isInactive}
                    />
                  </div>

                  <div className={styles.colName} title={user.name}>
                    {user.name}
                  </div>

                  <div className={styles.colEmail} title={user.email}>
                    {user.email}
                  </div>

                  <div className={styles.colRole}>
                    <span
                      className={`${styles.roleChip} ${getRoleClass(
                        user.role,
                        isInactive
                      )}`}
                    >
                      {user.role || "Member"}
                    </span>
                  </div>

                  <div className={styles.colActions}>
                    {user.isActive ? (
                      <>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          title={`Edit ${user.name}`}
                          onClick={() => setUserToEdit(user)}
                        >
                          <span className={`material-symbols-outlined ${styles.icon}`}>
                            edit
                          </span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.danger}`}
                          title={`Deactivate ${user.name}`}
                          onClick={() => setUserToDeactivate(user)}
                        >
                          <span className={`material-symbols-outlined ${styles.icon}`}>
                            block
                          </span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        title={`Restore ${user.name}`}
                        onClick={() => handleReactivate(user)}
                      >
                        <span className={`material-symbols-outlined ${styles.icon}`}>
                          settings_backup_restore
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {userToEdit && (
        <UserFormModal
          isOpen={!!userToEdit}
          onClose={() => setUserToEdit(null)}
          userToEdit={userToEdit}
        />
      )}

      {/* Deactivate User Confirmation Dialog */}
      {userToDeactivate && (
        <ConfirmDialog
          isOpen={!!userToDeactivate}
          onClose={() => setUserToDeactivate(null)}
          onConfirm={handleDeactivate}
          title="Deactivate User"
          message={`Are you sure you want to deactivate '${userToDeactivate.name}'? They will no longer be available for new task assignments.`}
          confirmLabel="Deactivate"
          variant="danger"
          isLoading={isUpdating}
        />
      )}
    </div>
  );
}
