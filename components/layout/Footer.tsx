import React from "react";
import styles from "./Footer.module.scss";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>TaskFlow Enterprise © {year}</span>
      </div>
    </footer>
  );
}
