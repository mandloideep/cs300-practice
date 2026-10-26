export default function PageTitle({ children }) {
  return <title>{children ? `${children} · CS300 Lab` : "CS300 Lab"}</title>;
}
