import { cn } from "@repo/lib/cn";
import { Instagram, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { pagePaddingX } from "../lib/page-padding";
import Tiktok from "./tiktok";
import { Button } from "@repo/ui/common/button";

export function AppFooter() {
  return (
    <footer
      className={cn(
        pagePaddingX,
        "flex items-center justify-between bg-card py-8",
      )}
    >
      <div className="flex flex-col items-end">
        <div className="flex gap-4">
          <Image
            src="/placeholder.svg"
            alt="ReWear Logo"
            className="size-12 rounded-md"
            unoptimized
            width={48}
            height={48}
          />

          <div>
            <p className="font-semibold">ReWear</p>
            <p className="text-sm text-muted-foreground">
              Your wardrobe, on demand.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="#" className="text-muted-foreground">
              <Mail className="size-6" />
              <span className="sr-only">Email</span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="#" className="text-muted-foreground">
              <Instagram className="size-6" />
              <span className="sr-only">Instagram</span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="#" className="text-muted-foreground">
              <Tiktok className="size-6" />
              <span className="sr-only">Tiktok</span>
            </Link>
          </Button>
        </div>
      </div>

      <p className="text-right text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ReWear. All rights reserved.
      </p>
    </footer>
  );
}
