import styles from './filter-popover.module.css';

export default function FeesLayout({ children }) {
  return <div className={styles.feesScope}>{children}</div>;
}
