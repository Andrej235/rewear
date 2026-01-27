"use client";
import { cn } from "@repo/lib/cn";
import { Button } from "@repo/ui/common/button";
import Image from "next/image";
import Link from "next/link";
import { pagePaddingX } from "../lib/page-padding";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/common/sheet";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

const navigation: { name: string; href: string }[] = [
  {
    name: "Browse Clothing",
    href: "/",
  },
  {
    name: "My Boxes",
    href: "/boxes",
  },
  {
    name: "Account",
    href: "/account",
  },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        pagePaddingX,
        "flex w-full items-center justify-between border-b bg-card/70 py-4",
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-4">
        <Image
          src="/placeholder.svg"
          alt="ReWear Logo"
          className="size-12 rounded-md"
          unoptimized
          width={48}
          height={48}
        />
        <h2 className="text-lg font-semibold">ReWear</h2>
      </div>

      {/* Desktop Navigation */}
      <nav className="ml-auto hidden space-x-6 md:flex">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "relative text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href ? "text-primary" : "text-muted-foreground",
            )}
          >
            {item.name}
            {pathname === item.href && (
              <motion.div
                className="absolute right-0 -bottom-1.5 left-0 h-0.5 bg-primary"
                layout
                layoutId="underline"
              />
            )}
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild className="ml-auto md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="max-w-full min-w-max p-8">
          <SheetTitle className="text-center font-serif text-2xl">
            Navigation Menu
          </SheetTitle>

          <nav className="flex flex-col space-y-4">
            {navigation.map((item) => (
              <Button
                key={item.name}
                asChild
                variant={pathname === item.href ? "secondary" : "ghost"}
              >
                <Link
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
