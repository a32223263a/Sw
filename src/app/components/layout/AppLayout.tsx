import { Link, useLocation } from "react-router";
import {
  FileText,
  FolderOpen,
  Inbox,
  Settings,
  Bell,
  Search,
  ChevronDown,
  User,
  Sparkles,
} from "lucide-react";

type NavItem = {
  id: string;
  path: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
};

const navItems: NavItem[] = [
  { id: "write", path: "/", icon: <FileText size={16} />, label: "결재 작성" },
  { id: "draft", path: "/drafts", icon: <FolderOpen size={16} />, label: "내 기안함", badge: 3 },
  { id: "pending", path: "/pending", icon: <Inbox size={16} />, label: "결재 대기함", badge: 7 },
  { id: "dept", path: "/dept", icon: <Settings size={16} />, label: "부서 관리" },
  { id: "forms", path: "/dept/forms", icon: <Sparkles size={16} />, label: "양식 빌더" },
];

export function AppLayout({
  children,
  user = { name: "박도윤", dept: "IT 기획팀", title: "사원" },
  contentOverflow = "scroll",
}: {
  children: React.ReactNode;
  user?: { name: string; dept: string; title: string };
  contentOverflow?: "scroll" | "hidden";
}) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/dept") return location.pathname === "/dept";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ─── Sidebar ─── */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
              <FileText size={14} className="text-white" />
            </div>
            <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
              전자결재
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                isActive(item.path)
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                {item.label}
              </span>
              {item.badge && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center">
              <User size={13} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>
                {user.name}
              </p>
              <p className="text-xs text-gray-500">{user.dept} · {user.title}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-4 shrink-0">
          <div className="flex-1 max-w-sm relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="검색어를 입력하세요..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 border border-transparent rounded-md focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex-1" />
          <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <Bell size={17} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={12} className="text-blue-600" />
            </div>
            <span className="text-sm text-gray-700">{user.name}</span>
            <ChevronDown size={13} className="text-gray-400" />
          </button>
        </header>

        {/* Page Content */}
        <div className={`flex-1 ${contentOverflow === "hidden" ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}>
          {children}
        </div>
      </div>
    </div>
  );
}