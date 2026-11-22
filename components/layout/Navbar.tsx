"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.scss";
import UserSwitcherDropdown, { UserSummary } from "./UserSwitcherDropdown";
import MobileNav from "./MobileNav";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export type NavPage = "dashboard" | "tasks" | "board" | "settings";

interface NavbarProps {
  currentPage?: NavPage;
  currentUser?: UserSummary;
  users?: UserSummary[];
  onSelectUser?: (user: UserSummary) => void;
}

export default function Navbar({
  currentPage,
  currentUser: propCurrentUser,
  users: propUsers,
  onSelectUser: propOnSelectUser,
}: NavbarProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Hook into Redux store current user
  const {
    currentUser: hookCurrentUser,
    allUsers: hookAllUsers,
    setCurrentUser: hookSetCurrentUser,
  } = useCurrentUser();

  const activeUser: UserSummary = propCurrentUser || hookCurrentUser || {
    id: "default",
    name: "Alex Kim",
    email: "alex.kim@taskflow.io",
    initials: "AK",
    color: "#0f62fe",
  };

  const usersList: UserSummary[] =
    propUsers ||
    (hookAllUsers.length > 0
      ? hookAllUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          initials: u.initials,
          color: u.avatarColor,
        }))
      : [activeUser]);

  // Determine current active page
  const resolvedPage: NavPage =
    currentPage ||
    (pathname.startsWith("/tasks")
      ? "tasks"
      : pathname.startsWith("/board")
      ? "board"
      : pathname.startsWith("/settings")
      ? "settings"
      : "dashboard");

  const handleUserSelect = (user: UserSummary) => {
    hookSetCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email,
      initials: user.initials,
      avatarColor: user.color,
    });
    if (propOnSelectUser) {
      propOnSelectUser(user);
    }
  };

  return (
    <>
      <header className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <Link href="/dashboard" className={styles.brand}>
              <span className={styles.logoSquare} />
              <span className={styles.brandText}>TaskFlow</span>
            </Link>

            <nav className={styles.navLinks} aria-label="Main Navigation">
              <Link
                href="/dashboard"
                className={`${styles.navLink} ${resolvedPage === "dashboard" ? styles.active : ""}`}
                aria-current={resolvedPage === "dashboard" ? "page" : undefined}
              >
                Dashboard
              </Link>
              <Link
                href="/tasks"
                className={`${styles.navLink} ${resolvedPage === "tasks" ? styles.active : ""}`}
                aria-current={resolvedPage === "tasks" ? "page" : undefined}
              >
                Tasks
              </Link>
              <Link
                href="/board"
                className={`${styles.navLink} ${resolvedPage === "board" ? styles.active : ""}`}
                aria-current={resolvedPage === "board" ? "page" : undefined}
              >
                Board
              </Link>
              <Link
                href="/settings/users"
                className={`${styles.navLink} ${resolvedPage === "settings" ? styles.active : ""}`}
                aria-current={resolvedPage === "settings" ? "page" : undefined}
              >
                Settings
              </Link>
            </nav>
          </div>

          <div className={styles.rightSection}>
            <button
              type="button"
              className={styles.userSwitcherBtn}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
              aria-label="User menu"
            >
              <div
                className={styles.userAvatar}
                style={activeUser.color ? { backgroundColor: activeUser.color } : undefined}
              >
                {activeUser.initials}
              </div>
              <span className={styles.userName}>{activeUser.name}</span>
              <span
                className={`material-symbols-outlined ${styles.expandIcon} ${
                  isDropdownOpen ? styles.open : ""
                }`}
              >
                expand_more
              </span>
              <div className={styles.userSecondaryAvatar}>
                <span className={`material-symbols-outlined ${styles.personIcon}`}>
                  person
                </span>
              </div>
            </button>

            <UserSwitcherDropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              currentUser={activeUser}
              users={usersList}
              onSelectUser={handleUserSelect}
            />

            <button
              type="button"
              className={styles.hamburgerBtn}
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
            >
              <span className={`material-symbols-outlined ${styles.icon}`}>
                {isMobileNavOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        currentPage={resolvedPage}
      />
    </>
  );
}
