import * as React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { cn } from "@repo/lib/cn";

function PageCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Card
      className={cn(
        "min-h-full min-w-0 border-none bg-transparent py-2 shadow-none md:py-6",
        className,
      )}
      {...props}
    />
  );
}

function PageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <CardHeader
      className={cn("gap-y-0.5 px-2 md:px-6", className)}
      {...props}
    />
  );
}

function PageTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <CardTitle className={cn("text-xl", className)} {...props} />;
}

function PageContent({ className, ...props }: React.ComponentProps<"div">) {
  return <CardContent className={cn("px-2 md:px-6", className)} {...props} />;
}

export {
  CardAction as PageAction,
  PageCard,
  PageContent,
  CardDescription as PageDescription,
  CardFooter as PageFooter,
  PageHeader,
  PageTitle,
};
