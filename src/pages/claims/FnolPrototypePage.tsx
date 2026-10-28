/**
 * Full-viewport host for the FNOL HTML prototype.
 * Opens the interactive page (not source) at /prototypes/FNOL-version-1.html.
 */
export function FnolPrototypePage() {
  return (
    <iframe
      title="First notice of loss"
      src="/prototypes/FNOL-version-1.html"
      style={{
        position: 'fixed',
        inset: 0,
        border: 'none',
        width: '100%',
        height: '100%',
        display: 'block',
        background: '#fff',
      }}
    />
  )
}
