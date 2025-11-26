import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PixelLogo } from "@/components/ui/PixelLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ModeToggle } from "@/components/mode-toggle";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to CaseFlow.",
        variant: "success", // Ensure you have this variant or use 'default'
      });
      navigate("/import");
    } catch (err: any) {
      toast({
        title: "Authentication Failed",
        description: err.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-background relative overflow-hidden">
      <header className="absolute top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-md">
              <Link to="/">
                <PixelLogo className="h-6 w-6 text-primary-foreground" />
              </Link>
            </div>
            <span className="text-2xl font-bold tracking-tight">CaseFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
          </div>
        </div>
      </header>
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        {/* Light Mode Gradient: Soft Blue/Purple */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/50 via-background to-background dark:hidden"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-100/50 via-background to-background dark:hidden"></div>

        {/* Dark Mode Gradient: Deep Blue/Navy */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-primary/5 blur-[100px] hidden dark:block"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] hidden dark:block"></div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 border-border/60 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/30">
              <PixelLogo className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight dark:text-foreground">
            CaseFlow
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background/50 text-foreground border-border focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background/50 text-foreground border-border focus:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full h-10 font-medium shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/50 w-full">
              <p className="text-xs font-medium text-muted-foreground text-center mb-2">
                Demo Accounts
              </p>
              <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground/80 font-mono text-center">
                <div className="flex justify-between px-2">
                  <span>Admin:</span>{" "}
                  <span className="text-foreground">admin@caseflow.com</span>
                </div>
                <div className="flex justify-between px-2">
                  <span>Pass:</span>{" "}
                  <span className="text-foreground">Admin@123</span>
                </div>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
