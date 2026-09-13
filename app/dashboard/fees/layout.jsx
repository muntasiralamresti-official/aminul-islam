import styles from './filter-popover.module.css';
import ViewModeLayout from '@/components/ViewModeLayout';

export default function FeesLayout({ children }) {
  return <div className={styles.feesScope}><ViewModeLayout page="fees">{children}</ViewModeLayout></div>;
}
