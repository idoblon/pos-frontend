import { useEffect, useState } from "react";
import { HelpCircle, Menu, X } from "lucide-react";
import Sidebar from "./sidebar/Sidebar";
import "./cashier-styles.css";

const SHORTCUTS = [
  ["F2", "Open checkout from the POS terminal"],
  ["H", "Hold the active cart from the POS terminal"],
  ["+ / -", "Adjust the most recent cart item"],
  ["Esc", "Close navigation and dialogs"],
];

export default function CashierPageShell({ title, description, children, actions }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        setHelpOpen(false);
      }
      if (event.key === "?") setHelpOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen && (
        <>
          <button className="sidebar-backdrop" aria-label="Close navigation menu" onClick={() => setSidebarOpen(false)} />
          <aside className="sidebar open" role="dialog" aria-label="Cashier navigation">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm sm:px-7">
        <button className="rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label="Open navigation menu" onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-slate-900">{title}</p>
          {description && <p className="truncate text-xs text-slate-500">{description}</p>}
        </div>
        {actions}
        <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Keyboard shortcut help" onClick={() => setHelpOpen(true)}>
          <HelpCircle size={19} />
        </button>
      </header>

      <main className="mx-auto w-full max-w-7xl p-4 sm:p-7">{children}</main>

      {helpOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcut help">
          <section className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Keyboard shortcuts</h2>
              <button className="rounded p-1 hover:bg-slate-100" aria-label="Close shortcut help" onClick={() => setHelpOpen(false)}><X size={18} /></button>
            </div>
            <dl className="space-y-3 text-sm">
              {SHORTCUTS.map(([key, meaning]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <dt className="text-slate-600">{meaning}</dt>
                  <dd><kbd className="rounded border border-slate-300 bg-slate-50 px-2 py-1 font-mono text-xs">{key}</kbd></dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      )}
    </div>
  );
}
