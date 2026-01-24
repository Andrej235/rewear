"use client";
import { useQuery } from "@repo/lib/api/use-query";
import {
  PageCard,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@repo/ui/common/page-card";
import { notFound, useParams } from "next/navigation";
import { api } from "../../../../../lib/api.client";
import { LoadingScreen } from "@repo/ui/loading-screen";

export default function ClothingItemInventoryPage() {
  const { id } = useParams();
  const originalItem = useQuery(api, "/clothing-items/{id}", {
    queryKey: ["admin-clothing-item", id],
    parameters: {
      id: id as string,
    },
    enabled: !!id && typeof id === "string",
  });

  if (originalItem.isLoading) return <LoadingScreen />;
  if (!originalItem.data || originalItem.isError) return notFound();

  return (
    <PageCard>
      <PageHeader>
        <PageTitle>Inventory of "{originalItem.data.name}"</PageTitle>
        <PageDescription>Modify available stock for this item.</PageDescription>
      </PageHeader>

      <PageContent></PageContent>
    </PageCard>
  );
}
