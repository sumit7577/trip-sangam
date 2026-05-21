/**
 * Root loading boundary — renders during route transitions until the page is
 * ready. Kept ultra-minimal: a top-edge crimson progress bar that animates
 * indefinitely (no layout shift, no flash of content).
 */
export default function RootLoading() {
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-line">
      <div
        className="h-full w-1/3 bg-crimson"
        style={{
          animation: "loading-bar 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        }}
      />
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
