import dynamic from "next/dynamic";
import { ReactNode } from "react";

const NoSSRComponent = ({ children }: { children: ReactNode }) => (
  <>{children}</>
);

export const NoSSR = dynamic(() => Promise.resolve(NoSSRComponent), {
  ssr: false,
});
