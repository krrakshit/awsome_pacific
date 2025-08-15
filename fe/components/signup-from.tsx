"use client";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn,useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React,{ useState } from 'react';
import Link from "next/link"
import { useAtom } from "jotai";
import { authAtom } from "@/lib/auth-atom";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [,setError] = useState("");
    const [,setSuccess] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useAtom(authAtom);
  const { data: session,} = useSession();
  React.useEffect(() => {
    setIsAuthenticated(!!session);
  }, [session, setIsAuthenticated]);
  
    const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccess("Registration successful! Redirecting to sign in...");
        setTimeout(() => router.push("/signin"), 1500);
      }
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
        <CardHeader>
          <CardTitle>Sign up to your account</CardTitle>
          <CardDescription>
            Enter your email below to sign up to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Sign up
                </Button>
                <Button variant="outline" className="w-full" onClick={() => signIn("google")}>
                  Sign up with Google
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
              <Link href="/signin" className="underline underline-offset-4">
                Sign in
              </Link> 
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}