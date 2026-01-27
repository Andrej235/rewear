// TODO: add size selection, auto select what fits the user, display brand, and redesign the page to look better
import { cn } from "@repo/lib/cn";
import { Button } from "@repo/ui/common/button";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/common/toggle-group";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getClothingItem } from "../../../../lib/get-clothing-item";
import { pagePaddingX } from "../../../../lib/page-padding";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const clothingItem = await getClothingItem(params.id);

  return {
    title: clothingItem?.name ?? "Not Found",
  };
}

export default async function FullClothingItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clothingItem = await getClothingItem(id);

  if (!clothingItem) return notFound();

  return (
    <div className={cn(pagePaddingX, "grid grid-cols-[auto_1fr] gap-12 py-8")}>
      <div className="flex flex-col gap-2">
        <Image
          src={clothingItem.imageUrl}
          alt={clothingItem.name}
          width={512}
          height={512}
          className="rounded-md border border-primary/50 object-cover transition-colors hover:border-primary"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold">{clothingItem.name}</h1>
        <p className="text-muted-foreground">{clothingItem.description}</p>

        <div className="mt-4 flex flex-col gap-1">
          <h2 className="font-medium">Details</h2>
          <p className="capitalize">
            <span className="font-semibold">Category:</span>{" "}
            {clothingItem.category}
          </p>
          <p className="capitalize">
            <span className="font-semibold">Gender Target:</span>{" "}
            {clothingItem.genderTarget}
          </p>
          <p className="capitalize">
            <span className="font-semibold">Colors:</span>{" "}
            {clothingItem.colors.filter((x) => x !== "none").join(", ")}
          </p>
          <p className="capitalize">
            <span className="font-semibold">Style:</span>{" "}
            <span className="capitalize">{clothingItem.primaryStyle}</span>
            {clothingItem.secondaryStyles.filter((x) => x !== "none").length >
              0 && (
              <>
                {" "}
                with elements of{" "}
                <span className="capitalize">
                  {clothingItem.secondaryStyles
                    .filter((x) => x !== "none")
                    .join(", ")}
                </span>
              </>
            )}
          </p>
          <p className="capitalize">
            <span className="font-semibold">Fit Types:</span>{" "}
            {clothingItem.fitType}
          </p>
          <p className="capitalize">
            <span className="font-semibold">Season:</span> {clothingItem.season}
          </p>
        </div>

        {clothingItem.sizes.length > 0 && (
          <ToggleGroup
            type="single"
            className="mt-4"
            spacing={2}
            variant="outline"
          >
            {clothingItem.sizes.map((size) => (
              <ToggleGroupItem key={size} value={size} className="px-4 py-2">
                {size}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}

        <Button
          disabled={clothingItem.sizes.length === 0}
          size="lg"
          className="w-96"
        >
          Add to Box
        </Button>
      </div>
    </div>
  );
}
