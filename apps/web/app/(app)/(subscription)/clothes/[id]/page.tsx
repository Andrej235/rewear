import { cn } from "@repo/lib/cn";
import { toTitleCase } from "@repo/lib/utils/title-case";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/common/table";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SizeSelector } from "../../../../../components/size-selector";
import { getClothingItem } from "../../../../../lib/get-clothing-item";
import { pagePaddingX } from "../../../../../lib/page-padding";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const clothingItem = await getClothingItem(id);

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
    <div
      className={cn(pagePaddingX, "grid gap-12 py-8 lg:grid-cols-[auto_1fr]")}
    >
      <div className="mx-auto aspect-square max-w-[80vw] lg:mx-0 lg:size-auto">
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2} className="w-40">
                Details
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell className="w-1/2 md:w-1/3">Category</TableCell>
              <TableCell className="capitalize">
                {clothingItem.category}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Brand</TableCell>
              <TableCell className="capitalize">
                {clothingItem.brandName}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Primary Style</TableCell>
              <TableCell className="capitalize">
                {clothingItem.primaryStyle}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Secondary Styles</TableCell>
              <TableCell>
                {joinEnumWithCommasAndAnd(clothingItem.secondaryStyles)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Colors</TableCell>
              <TableCell>
                {joinEnumWithCommasAndAnd(clothingItem.colors)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Fit Type</TableCell>
              <TableCell className="capitalize">
                {clothingItem.fitType}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Season</TableCell>
              <TableCell className="capitalize">
                {clothingItem.season}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Material</TableCell>
              <TableCell className="capitalize">
                {clothingItem.material}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Sizes */}
        <SizeSelector
          availableSizes={clothingItem.sizes}
          clothingCategory={clothingItem.category}
          clothingItemId={clothingItem.id}
        />
      </div>
    </div>
  );
}

function joinEnumWithCommasAndAnd(items: string[]): string {
  items = items
    .filter((i) => i !== "none" && i.trim().length > 0)
    .map((x) => {
      let res = x.trim();
      res = res.replace(/_/g, " ");
      res = toTitleCase(res);

      return res;
    });

  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
}
