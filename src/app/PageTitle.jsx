export default function PageTitle({ children }) {
  return <title>{children ? `${children} · CS300 Practice` : "CS300 Practice"}</title>;
}
