"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./UserSwitcherDropdown.module.scss";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  initials: string;
  color?: string;
}

interface UserSwitcherDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSummary | null;
  users: UserSummary[];
  onSelectUser: (user: UserSummary) => void;
}

export default function UserSwitcherDropdown({
  isOpen,
  onClose,
  currentUser,
  users,
  onSelectUser,
}: UserSwitcherDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.dropdown} ref={dropdownRef} role="menu">
      <div className={styles.header}>Switch Active User</div>
      <div className={styles.userList}>
        {users.map((user) => {
          const isSelected = currentUser?.id === user.id;
          return (
            <button
              key={user.id}
              type="button"
              className={`${styles.userItem} ${isSelected ? styles.active : ""}`}
              onClick={() => {
                onSelectUser(user);
                onClose();
              }}
              role="menuitem"
            >
              <div className={styles.userInfo}>
                <div
                  className={styles.avatar}
                  style={user.color ? { backgroundColor: user.color } : undefined}
                >
                  {user.initials}
                </div>
                <div className={styles.userDetails}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userEmail}>{user.email}</span>
                </div>
              </div>
              {isSelected && (
                <span className={`material-symbols-outlined ${styles.checkIcon}`}>
                  check
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className={styles.footer}>
        <Link href="/settings/users" className={styles.manageLink} onClick={onClose}>
          <span className={`material-symbols-outlined ${styles.icon}`}>settings</span>
          <span>Manage Users</span>
        </Link>
      </div>
    </div>
  );
}
