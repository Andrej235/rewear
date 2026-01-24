"use client";
import { useQuery } from "@repo/lib/api/use-query";
import { Button } from "@repo/ui/common/button";
import {
  PageAction,
  PageCard,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@repo/ui/common/page-card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { api } from "../../../lib/api.client";
import { LoadingScreen } from "@repo/ui/loading-screen";

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
    </PageCard>
  );
}
