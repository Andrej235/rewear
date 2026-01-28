"use client";
import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { useQuery } from "@repo/lib/api/use-query";
import { Button } from "@repo/ui/common/button";
import { Separator } from "@repo/ui/common/separator";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/common/toggle-group";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api.client";

type Props = {
  availableSizes: string[];
  clothingCategory: Schema<"ClothingCategory">;
  clothingItemId: string;
};

export function SizeSelector({
  availableSizes: sizes,
  clothingCategory,
  clothingItemId,
}: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const waitingForResponse = useRef(false);

  const sizeTypes = useMemo<Schema<"SizeType">[]>(() => {
    switch (clothingCategory) {
      case "top":
      case "outerwear":
        return ["top"];
      case "bottom":
        return ["bottomLength", "bottomWaist"];
      case "footwear":
        return ["shoe"];
    }

    return [];
  }, [clothingCategory]);

  const userSizes = useQuery(api, "/users/me/sizes", {
    parameters: {
      sizeTypes: sizeTypes,
    },
    queryKey: ["users", "me", "sizes", sizeTypes],
    enabled: sizeTypes.length > 0,
  });

  useEffect(() => {
    if (!userSizes.data) return;

    switch (clothingCategory) {
      case "top":
      case "outerwear":
        setSelectedSize(
          (
            userSizes.data.find(
              (x) => x.sizeType === "top" && sizes.some((y) => y === x.label),
            ) ?? null
          )?.label || null,
        );
        break;

      case "bottom": {
        const waistSizes = userSizes.data.filter(
          (x) => x.sizeType === "bottomWaist",
        );
        const lengthSizes = userSizes.data.filter(
          (x) => x.sizeType === "bottomLength",
        );

        const selectedSize = sizes.find((size) =>
          waistSizes.some((waist) =>
            lengthSizes.some(
              (length) => `${waist.label} x ${length.label}` === size,
            ),
          ),
        );
        if (selectedSize) setSelectedSize(selectedSize);

        break;
      }

      case "footwear":
        setSelectedSize(
          (
            userSizes.data.find(
              (x) => x.sizeType === "shoe" && sizes.some((y) => y === x.label),
            ) ?? null
          )?.label || null,
        );
        break;
    }
  }, [userSizes.data, clothingCategory, sizes]);

  async function handleAdd() {
    if (waitingForResponse.current || !selectedSize) return;
    waitingForResponse.current = true;

    await api.sendRequest(
      "/delivery-boxes/latest/add-item/{clothingItemId}",
      {
        method: "post",
        parameters: {
          clothingItemId,
          size: selectedSize,
        },
      },
      {
        toasts: {
          success: "Item added to your latest box!",
          loading: "Adding item to your latest box...",
          error: (e) => e.message || "Failed to add item to your latest box.",
        },
      },
    );

    waitingForResponse.current = false;
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <Separator className="max-w-2/5" />

      {sizes.length > 0 && (
        <ToggleGroup
          type="single"
          className="mt-4"
          spacing={2}
          variant="outline"
          value={selectedSize ?? ""}
          onValueChange={setSelectedSize}
        >
          {sizes.map((size) => (
            <ToggleGroupItem key={size} value={size} className="px-4 py-2">
              {size}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}

      <Button
        disabled={sizes.length === 0 || !selectedSize}
        size="lg"
        className="w-full max-w-96"
        onClick={handleAdd}
      >
        Add to Box
      </Button>
    </div>
  );
}
