"use client";
import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { useQuery } from "@repo/lib/api/use-query";
import { Badge } from "@repo/ui/common/badge";
import { Button } from "@repo/ui/common/button";
import {
  Card,
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
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "../../../../../lib/api.client";
import { pagePaddingX } from "../../../../../lib/page-padding";

export default function LatestBoxPage() {
  const latestBoxQuery = useQuery(api, "/delivery-boxes/latest", {
    queryKey: ["latest-box"],
  });

  function renderSize(invItem: Schema<"InventoryItemResponseDto">) {
    switch (invItem.category) {
      case "top":
      case "outerwear":
        return invItem.topSize!;
      case "bottom":
        return invItem.bottomWaistSize + " x " + invItem.bottomLengthSize;
      case "footwear":
        return invItem.shoeSize!;
      default:
        return "N/A";
    }
  }

  if (latestBoxQuery.isLoading) return <LoadingScreen />;

  const latestBox = latestBoxQuery.data;

  return (
    <PageCard className={pagePaddingX}>
      <PageHeader className="px-0!">
        <PageTitle>Your Latest Box</PageTitle>
        <PageDescription>
          Manage clothes you wish to receive in your next box
        </PageDescription>

        <PageAction>
          <Button>
            <span>Fill With AI</span>
            <Sparkles className="ml-2" />
          </Button>
        </PageAction>
      </PageHeader>

      <PageContent className="px-0!">
        {!latestBox ||
          (latestBox.items.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              No items in your latest box yet.
            </div>
          ))}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
          {latestBox?.items.map(
            ({ clothingItem: item, chosenByAi, inventoryItem: invItem }) => (
              <Link key={item.id} href={`/${item.id}`} className="max-w-full">
                <Card className="min-h-full gap-4 border-2 border-primary/40 pt-0 transition-colors hover:border-primary">
                  <div className="relative aspect-2/1 w-full lg:h-64">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="h-64 w-full min-w-0 rounded object-cover"
                    />
                  </div>

                  <CardHeader>
                    <CardTitle>
                      <span>{item.name}</span>
                      {chosenByAi && <Badge className="ml-2">AI</Badge>}
                    </CardTitle>

                    <CardDescription className="flex min-w-0 items-center">
                      {item.description.length > 200
                        ? item.description.slice(0, 200) + "..."
                        : item.description || "No description"}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="justify-end">
                    <p className="text-sm text-muted-foreground">
                      {renderSize(invItem)}
                    </p>
                  </CardFooter>
                </Card>
              </Link>
            ),
          )}
        </div>
      </PageContent>
    </PageCard>
  );
}
