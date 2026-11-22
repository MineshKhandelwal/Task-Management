import React from "react";
import Navbar, { NavPage } from "./Navbar";
import Footer from "./Footer";
import styles from "./PageShell.module.scss";

interface PageShellProps {
  children: React.ReactNode;
  currentPage?: NavPage;
}

export default function PageShell({ children, currentPage }: PageShellProps) {
  return (
    <div className={styles.wrapper}>
      <Navbar currentPage={currentPage} />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
      <Footer />
    </div>
  );
}
