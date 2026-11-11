// A text input or textarea with its icon at the inline start.
export function IconInput({ icon: Icon, area, children }) {
  return <div className={`icon-input${area ? " area" : ""}`}><Icon size={16} aria-hidden="true" />{children}</div>;
}
