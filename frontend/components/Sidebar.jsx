"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  TrendingUp,
  Calendar,
  MonitorPlay,
  ChevronLeft,
  Menu,
} from "lucide-react";

const menuItems = [
  { label: "Visão Geral", href: "/", icon: LayoutGrid },
  { label: "Análise Competitiva", href: "/analise-competitiva", icon: TrendingUp },
  { label: "Semana", href: "/semana", icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* botão hambúrguer, só aparece quando a tela é pequena */}
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* overlay escuro atrás do sidebar quando o botão hambúrguer é clicado */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <MonitorPlay size={20} />
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-title">TV Analytics</div>
            <div className="sidebar-brand-subtitle">Audiência Televisiva</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link ${active ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} />
                <span className="sidebar-link-label">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* botão de encolher*/}
        <button
          type="button"
          className="sidebar-collapse-toggle"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expandir menu" : "Encolher menu"}
        >
          <ChevronLeft size={18} className={collapsed ? "rotate-180" : ""} />
        </button>
      </aside>
    </>
  );
}