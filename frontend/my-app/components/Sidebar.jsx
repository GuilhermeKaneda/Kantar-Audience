"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, TrendingUp, Calendar, SlidersHorizontal, MonitorPlay } from "lucide-react";

const menuItems = [
  { label: "Visão Geral", href: "/", icon: LayoutGrid },
  { label: "Análise Competitiva", href: "/analise-competitiva", icon: TrendingUp },
  { label: "Semana", href: "/semana", icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <MonitorPlay size={20} />
        </div>
        <div>
          <div className="sidebar-brand-title">TV Analytics</div>
          <div className="sidebar-brand-subtitle">Audiência Televisiva</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`sidebar-link ${active ? "active" : ""}`}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
