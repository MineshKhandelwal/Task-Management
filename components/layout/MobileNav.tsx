"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MobileNav.module.scss";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: "dashboard" | "tasks" | "board" | "settings";
}

export default function MobileNav({ isOpen, onClose, currentPage }: MobileNavProps) {
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isUsers = pathname === "/settings/users";
  const isStatuses = pathname === "/settings/statuses";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <Link
          href="/dashboard"
          className={`${styles.navLink} ${currentPage === "dashboard" ? styles.active : ""}`}
          onClick={onClose}
        >
          Dashboard
        </Link>
        <Link
          href="/tasks"
          className={`${styles.navLink} ${currentPage === "tasks" ? styles.active : ""}`}
          onClick={onClose}
        >
          Tasks
        </Link>
        <Link
          href="/board"
          className={`${styles.navLink} ${currentPage === "board" ? styles.active : ""}`}
          onClick={onClose}
        >
          Board
        </Link>
        <Link
          href="/settings/users"
          className={`${styles.navLink} ${currentPage === "settings" ? styles.active : ""}`}
          onClick={onClose}
        >
          Settings
        </Link>
        <Link
          href="/settings/users"
          className={`${styles.subNavLink} ${isUsers ? styles.active : ""}`}
          onClick={onClose}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            group
          </span>
          <span>Users</span>
        </Link>
        <Link
          href="/settings/statuses"
          className={`${styles.subNavLink} ${isStatuses ? styles.active : ""}`}
          onClick={onClose}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            label
          </span>
          <span>Statuses</span>
        </Link>
      </div>
    </div>
  );
}
