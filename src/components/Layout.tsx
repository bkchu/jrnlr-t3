import { ReactNode } from "react";

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="container mx-auto p-4">{children}</div>
);
