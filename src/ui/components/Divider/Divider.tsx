import type { ReactNode } from 'react';
import styles from './Divider.module.css';

export function Divider({ children }: { children: ReactNode }) {
  return (
    <div className={styles.divider}>
      <span className={styles.line} aria-hidden="true" />
      <span className={styles.text}>{children}</span>
      <span className={styles.line} aria-hidden="true" />
    </div>
  );
}
