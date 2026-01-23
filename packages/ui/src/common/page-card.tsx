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
        "min-h-screen min-w-0 border-none bg-transparent shadow-none",
        className,
      )}
      {...props}
    />
  );
}

function PageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <CardHeader className={cn("gap-y-0.5", className)} {...props} />;
}

function PageTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <CardTitle className={cn("text-xl", className)} {...props} />;
}

export {
  CardAction as PageAction,
  PageCard,
  CardContent as PageContent,
  CardDescription as PageDescription,
  CardFooter as PageFooter,
  PageHeader,
  PageTitle,
};
