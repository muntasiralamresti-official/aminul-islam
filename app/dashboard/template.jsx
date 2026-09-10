import Breadcrumbs from '@/components/Breadcrumbs';

export default function DashboardTemplate({ children }) {
  return (
    <div className="page-transition min-h-full">
      <Breadcrumbs />
      {children}
    </div>
  );
}
