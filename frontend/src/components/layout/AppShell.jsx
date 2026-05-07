import { LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AppShell = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-lg font-bold">Skill Exchange Platform</p>
              <p className="text-sm text-slate-500">Learn, teach, and meet without money</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{user?.name}</span>
            <button
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700"
              onClick={logout}
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
};

export default AppShell;
