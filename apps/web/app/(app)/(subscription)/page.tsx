"use client";
import { useQuery } from "@repo/lib/api/use-query";
import { JSX, useState } from "react";
import { api } from "../../../lib/api.client";
import { LoadingScreen } from "@repo/ui/loading-screen";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/common/card";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@repo/ui/common/badge";
import { Dot } from "lucide-react";
import { cn } from "@repo/lib/cn";
import { pagePaddingX } from "../../../lib/page-padding";

export default function Home(): JSX.Element {
  const [page] = useState(0);

  const previews = useQuery(api, "/clothing-items/previews", {
    parameters: {
      onlyInStock: true,
      limit: 20,
      offset: page * 20,
    },
    queryKey: ["clothing-item-previews"],
  });

  if (previews.isLoading) return <LoadingScreen />;

  return (
    <div className={cn(pagePaddingX, "grid grid-cols-[auto_1fr]")}>
      <div className="h-full bg-card">Filters Sidebar</div>

      <div className="flex flex-wrap gap-4 p-4">
        {previews.data?.map((item) => (
          <Card
            className="min-h-full gap-4 border-2 border-primary/40 pt-0 transition-colors hover:border-primary"
            key={item.id}
          >
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={512}
              height={256}
              className="h-64 w-full rounded object-cover"
            />

            <CardHeader>
              <CardTitle>
                <Link href={`/admin/clothing-items/${item.id}`}>
                  {item.name} (
                  {item.category === "none" ? "no category" : item.category})
                </Link>
              </CardTitle>
              <CardDescription className="flex min-w-0 items-center">
                <span className="max-w-2/3 truncate">
                  {item.brandName || "No brand"}
                </span>{" "}
                <Dot className="-mx-1 inline" />{" "}
                {item.genderTarget === "none" && (
                  <Badge variant="destructive">No gender specified</Badge>
                )}
                {item.genderTarget !== "none" && (
                  <Badge variant="outline" className="capitalize">
                    {item.genderTarget}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
