"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-context";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (!acceptTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        router.push("/login");
        toast({
          title: "Success",
          description: "Registration successful. Please log in.",
        });
      } else {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h2 className="text-center text-3xl font-bold text-foreground mb-6">
          Registration
        </h2>
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={setAcceptTerms}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I accept all{" "}
                <span>
                  <Link href="/terms" className="text-primary hover:underline">
                    terms & conditions
                  </Link>
                </span>
              </label>
            </div>
            <Button type="submit" className="w-full">
              Register Now
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
