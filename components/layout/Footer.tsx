"use client";

import React from "react";
import styles from "./Footer.module.scss";

export default function Footer() {
  const year = 2025;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>TaskFlow Enterprise © {year}</span>
      </div>
    </footer>
  );
}
