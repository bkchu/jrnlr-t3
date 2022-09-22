import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";
import { trpc } from "../utils/trpc";

type OnboardCheckProps = {
  children: ReactNode;
};

export const OnboardCheck = ({ children }: OnboardCheckProps) => {
  const router = useRouter();
  const { data: session } = trpc.useQuery(["auth.getSession"]);

  useEffect(() => {
    if (session?.user?.id) {
      if (!session.user.isOnboarded) {
        router.push("/onboarding");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return <>{children}</>;
};
