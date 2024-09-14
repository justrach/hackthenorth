import { ReactNode } from "react";

import { Inter } from "next/font/google";
import { NavBar } from "@/components/nav-bar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={inter.className}>

      <main>
        <NavBar />{children}
        </main>
    </div>
  );
}
