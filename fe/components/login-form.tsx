"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { signIn,useSession} from 'next-auth/react';
import React,{ useState } from 'react';
import { useAtom } from "jotai";
import { authAtom } from "@/lib/auth-atom";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
 
   const [,setError] = useState("");
    const [,setSuccess] = useState("");

    const [isAuthenticated, setIsAuthenticated] = useAtom(authAtom);
  const { data: session} = useSession();
  React.useEffect(() => {
    setIsAuthenticated(!!session);
  }, [session, setIsAuthenticated]);

    const handleGoogleSignIn = async () => {
        setError("");
        setSuccess("");
        await signIn("google", { callbackUrl: "/" });
    };

     const handleGithubSignIn = async () => {
        setError("");
        setSuccess("");
        await signIn("github", { callbackUrl: "/" });
    };

    if (isAuthenticated) {
      return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader>
              <CardTitle>Already signed in</CardTitle>
              <CardDescription>
                You are already signed in.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      );
    }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        
        <CardContent> 
            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn}>
                  Login with Google
                </Button>
                 <Button variant="outline" className="w-full" type="button" onClick={handleGithubSignIn}>
                  Login with Github
                </Button>
        </CardContent>
      </Card>
    </div>
  )
}