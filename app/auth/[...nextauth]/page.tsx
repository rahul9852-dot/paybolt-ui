"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VerifyingPopus from "@/components/VerifyingPopups/VerifyingPopus";
import { transformStringFromSnakeCase } from "@/utils/common-utils";
import { useVerifyToken } from "@/hooks/useVerifyToken";
import UsersBasicDetails from "../merchant-info/page";
import { safeAny } from "@/interfaces/global.interface";

interface AuthRouteParams {
  nextauth: string[];
}

interface AuthRouteSearchParams {
  token?: string;
  error?: string;
  x?: string;
  [key: string]: string | undefined;
}

interface AuthRouteRequest {
  params: AuthRouteParams;
  searchParams: AuthRouteSearchParams;
}

interface verificationStatusProps {
  email: string;
  is2FAEnabled: boolean;
  onboardingStatus: number;
}

const AuthRoute = ({ params, searchParams }: AuthRouteRequest) => {
  const { nextauth } = params;
  const { token } = searchParams;
  const { error } = searchParams;
  const { x } = searchParams;
  const router = useRouter();

  const { refetch } = useVerifyToken(nextauth[0], token ?? "");
  const [loading, setLoading] = useState(true);
  const [componentToRender, setComponentToRender] =
    useState<React.ReactNode>(null);

  useEffect(() => {
    if (token) {
      refetch().then((res: any) => {
        console.log("res--->", res);
        if (typeof window !== "undefined") {
          const verificationStatus = {
            email: res?.data?.email,
            is2FAEnabled: res?.data?.is2FAEnabled,
            onboardingStatus: res?.data?.onboardingStatus,
          };

          localStorage.setItem(
            "verificationStatus",
            JSON.stringify(verificationStatus)
          );
        }

        if (error) {
          setComponentToRender(
            <VerifyingPopus
              title={transformStringFromSnakeCase(error)}
              content="Please verify your account"
              isOpen={true}
            />
          );
        }

        if (res?.data?.onboardingStatus === 1) {
          router.push("/auth/merchant");
        } else if (res?.data && res?.data?.onboardingStatus === 2) {
          router.push("/auth/multifactor");
        } else {
          router.push("/sign-in");
        }
        // else if (x && +x === AuthenticationType.SIGN_UP) {
        setComponentToRender(<UsersBasicDetails />);
        // } else if (x && +x === AuthenticationType.BUSINESS_DETAILS) {
        // router.push("/login-2fa");
        // }

        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token, x, error, refetch, router]);

  if (loading) {
    return <div>Loading...</div>; // or a spinner/loading component
  }

  return <>{componentToRender}</>;
};

export default AuthRoute;
