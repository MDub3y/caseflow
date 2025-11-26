import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PixelLogo } from "@/components/ui/PixelLogo";
import { ModeToggle } from "@/components/mode-toggle";
import { CheckCircle, Zap, Shield } from "lucide-react";
import { DemoGrid } from "@/components/landing/DemoGrid";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-md">
              <PixelLogo className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">CaseFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <Link to="/login">
              <Button
                variant="ghost"
                className="text-muted-foreground dark:text-foreground hover:text-foreground dark:hover:text-primary-foreground"
              >
                Log In
              </Button>
            </Link>
            <Link to="/login">
              <Button className="font-semibold shadow-lg shadow-primary/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-50 mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] opacity-50 mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        </div>

        <div className="container relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Hero Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                v1.0 Now Available
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Data Import <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                  Reimagined.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Stop wrestling with CSVs. Validate, clean, and ingest data 10x
                faster with our intelligent, browser-based grid.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link to="/login">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 text-base shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-transform"
                  >
                    Start Free Trial
                  </Button>
                </Link>
                <Link to="#">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-8 text-base bg-background/50 backdrop-blur border-border hover:bg-accent"
                  >
                    View Documentation
                  </Button>
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 text-muted-foreground grayscale opacity-70">
                {/* Simple logos or text for social proof */}
                <span className="font-semibold text-sm">
                  TRUSTED BY TEAMS AT
                </span>
                <span className="font-bold">ACME Corp</span>
                <span className="font-bold">Globex</span>
                <span className="font-bold">Soylent</span>
              </div>
            </div>

            {/* Hero Visual (The Animated Grid) */}
            <div className="flex-1 w-full max-w-xl lg:max-w-none perspective-1000">
              <div className="relative transform lg:rotate-y-[-5deg] lg:rotate-x-[5deg] transition-transform duration-500 hover:rotate-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-xl blur opacity-30 dark:opacity-50"></div>
                <DemoGrid />

                {/* Floating Badge */}
                <div className="absolute -right-6 bg-card border border-border p-4 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-slow hidden md:flex">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="">
                    <p className="text-sm font-bold text-foreground">
                      Auto-Correction
                    </p>
                    <p className="text-xs text-muted-foreground">
                      2 errors fixed automatically
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">
              Why data teams choose CaseFlow
            </h2>
            <p className="text-muted-foreground text-lg">
              We handle the messy parts of data ingestion so you can focus on
              the insights.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              description="Process up to 50,000 rows in seconds directly in your browser. No spinner fatigue."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Smart Validation"
              description="Catch typos, duplicates, and format errors before they corrupt your database."
            />
            <FeatureCard
              icon={Shield}
              title="Enterprise Secure"
              description="Role-based access control and comprehensive audit logs keep your data safe."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <PixelLogo className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg">CaseFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; 2025 CaseFlow Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <div className="relative p-8 rounded-xl border border-border/50 overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
    {/* Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-card via-card/50 to-muted/20 dark:from-card dark:via-card/80 dark:to-primary/10 opacity-100 transition-opacity" />

    {/* Hover Gradient Accent */}
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    {/* Content */}
    <div className="relative z-10">
      <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 text-primary rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);
