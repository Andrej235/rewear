"use client";
import { useQuery } from "@repo/lib/api/use-query";
import { Badge } from "@repo/ui/common/badge";
import { Button } from "@repo/ui/common/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/common/card";
import {
  PageAction,
  PageCard,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@repo/ui/common/page-card";
import { LoadingScreen } from "@repo/ui/loading-screen";
import { Dot, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "../../../lib/api.client";
import { Separator } from "@repo/ui/common/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/common/tooltip";

export default function ClothingItemsPage() {
  const items = useQuery(api, "/clothing-items/all", {
    queryKey: ["admin-clothing-items"],
  });

  if (items.isLoading) return <LoadingScreen />;

  return (
    <PageCard>
      <PageHeader>
        <PageTitle>Clothing Items</PageTitle>
        <PageDescription>
          Manage all clothing items available in the store.
        </PageDescription>

        <PageAction>
          <Button asChild>
            <Link href="/admin/clothing-items/new">
              <span>New</span>
              <Plus className="ml-2" />
            </Link>
          </Button>
        </PageAction>
      </PageHeader>

      <PageContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.data?.map((item) => (
            <Card
              key={item.id}
              className="gap-4 border-2 border-primary/40 pt-0 transition-colors hover:border-primary"
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

                <CardDescription className="flex items-center capitalize">
                  <span>{item.brandName || "No Brand"}</span>{" "}
                  <Dot className="-mx-1 inline" />{" "}
                  <span>{item.genderTarget}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 capitalize">
                <div className="flex max-w-full flex-wrap gap-2">
                  {item.fitType !== "none" && <Badge>{item.fitType}</Badge>}

                  {item.fitType === "none" && (
                    <Badge variant="destructive">No Fit Type</Badge>
                  )}

                  {item.primaryStyle !== "none" && (
                    <Badge variant="default">{item.primaryStyle}</Badge>
                  )}

                  {item.primaryStyle === "none" && (
                    <Badge variant="destructive">No Primary Style</Badge>
                  )}

                  {item.secondaryStyles
                    .filter((x) => x !== "none")
                    .map((style) => (
                      <Badge variant="secondary" key={style}>
                        {style}
                      </Badge>
                    ))}

                  {item.season !== "all" && <Badge>{item.season}</Badge>}

                  {item.material !== "none" && (
                    <Badge variant="outline">{item.material}</Badge>
                  )}

                  {item.colors
                    .filter((x) => x !== "none")
                    .map((color) => (
                      <Badge key={color} variant="outline">
                        {color}
                      </Badge>
                    ))}

                  {item.colors.filter((x) => x !== "none").length === 0 && (
                    <Badge variant="destructive">No Colors</Badge>
                  )}
                </div>

                <p className="text-sm">
                  {item.description.slice(0, 100) || "No description"}
                </p>
              </CardContent>

              <Separator />

              <CardFooter className="justify-between">
                <Tooltip delayDuration={250}>
                  <TooltipTrigger>
                    <p className="text-sm">
                      {item.isActive ? "Active" : "Inactive"}
                    </p>
                  </TooltipTrigger>

                  <TooltipContent>
                    {item.isActive
                      ? "This item is visible to customers."
                      : "This item is hidden from customers."}
                  </TooltipContent>
                </Tooltip>

                <p className="text-sm">{item.stock} in stock</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </PageContent>
    </PageCard>
  );
}
