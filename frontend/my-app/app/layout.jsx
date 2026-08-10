import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "TV Analytics",
  description: "Audiência Televisiva",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-shell">
          <Sidebar />
          <main className="app-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
