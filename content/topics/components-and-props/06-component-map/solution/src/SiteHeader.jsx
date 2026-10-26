export default function SiteHeader({ siteName }) {
  return (
    <header className="site-header">
      <p className="brand">{siteName}</p>
      <p>Plan your next term</p>
    </header>
  );
}
