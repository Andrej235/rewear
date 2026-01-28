"use client";
import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { useQuery } from "@repo/lib/api/use-query";
import { cn } from "@repo/lib/cn";
import { Button } from "@repo/ui/common/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/common/card";
import { Checkbox } from "@repo/ui/common/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/common/collapsible";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@repo/ui/common/field";
import { Input } from "@repo/ui/common/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/common/sheet";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/common/toggle-group";
import { LoadingScreen } from "@repo/ui/loading-screen";
import { ChevronRight, ListFilterPlus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, JSX, SetStateAction, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "../../../lib/api.client";
import { pagePaddingX } from "../../../lib/page-padding";

const categories: Schema<"ClothingCategory">[] = [
  "top",
  "outerwear",
  "bottom",
  "footwear",
];

const genders: Schema<"GenderTarget">[] = ["male", "female", "unisex"];

const styles: Schema<"Style">[] = [
  "minimal",
  "streetwear",
  "casual",
  "formal",
  "sporty",
  "classic",
  "business",
];

const fits: Schema<"Fit">[] = ["slim", "regular", "loose"];

const colors: Schema<"Color">[] = [
  "black",
  "white",
  "gray",
  "blue",
  "green",
  "brown",
  "beige",
  "red",
];

const seasons: Schema<"Season">[] = ["all", "summer", "winter"];

const materials: Schema<"Material">[] = [
  "cotton",
  "polyester",
  "wool",
  "silk",
  "denim",
  "leather",
  "linen",
  "nylon",
  "spandex",
  "rayon",
];

type Filters = {
  name: string;
  categories: Schema<"ClothingCategory">[];
  gender: Schema<"GenderTarget">[];
  colors: Schema<"Color">[];
  styles: Schema<"Style">[];
  fitTypes: Schema<"Fit">[];
  season: Schema<"Season">;
  materials: Schema<"Material">[];
  onlyInStock: boolean;
  strict: boolean;
};

const baseFilters: Filters = {
  name: "",
  gender: [],
  categories: [],
  styles: [],
  colors: [],
  fitTypes: [],
  season: "all",
  materials: [],
  onlyInStock: true,
  strict: false,
};

export default function Home(): JSX.Element {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useLocalStorage<Filters>(
    "clothing-item-filters",
    baseFilters,
  );

  const previews = useQuery(api, "/clothing-items/previews", {
    parameters: {
      Limit: 20,
      Offset: page * 20,
      Name: filters.name.length > 0 ? filters.name : undefined,
      OnlyInStock: filters.onlyInStock,
      Strict: filters.strict,
      Categories:
        filters.categories.length > 0 ? filters.categories : undefined,
      Colors: filters.colors.length > 0 ? filters.colors : undefined,
      FitTypes: filters.fitTypes.length > 0 ? filters.fitTypes : undefined,
      Gender: filters.gender.length > 0 ? filters.gender : undefined,
      Styles: filters.styles.length > 0 ? filters.styles : undefined,
      Materials: filters.materials.length > 0 ? filters.materials : undefined,
      Season: filters.season !== "all" ? filters.season : undefined,
    },
    queryKey: ["clothing-item-previews"],
  });

  function applyFilters() {
    setPage(0);
    previews.refetch();
  }

  if (previews.isLoading) return <LoadingScreen />;

  return (
    <div
      className={cn(
        pagePaddingX,
        "grid gap-4 py-8 md:grid-cols-[auto_1fr] md:gap-8",
      )}
    >
      {/* Desktop Filters */}
      <div className="hidden h-max min-h-max w-xs flex-col gap-2 rounded-lg bg-card p-4 md:flex">
        <p className="text-sm text-muted-foreground">Filters</p>

        <FiltersUI
          filters={filters}
          setFilters={setFilters}
          applyFilters={applyFilters}
        />
      </div>

      {/* Mobile Filters */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button className="w-full md:hidden">
            <ListFilterPlus />
            <span>Filters</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[70vh] bg-card">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>

          <div className="max-h-full space-y-2 overflow-auto px-4 pb-4">
            <FiltersUI
              filters={filters}
              setFilters={setFilters}
              applyFilters={applyFilters}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Previews */}
      <div className="grid w-full content-start gap-4 sm:grid-cols-2 sm:gap-2 md:grid-cols-1 md:gap-4 lg:grid-cols-2 3xl:grid-cols-3">
        {previews.data?.map((item) => (
          <Link key={item.id} href={item.id} className="max-w-full">
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
                <CardTitle>{item.name}</CardTitle>

                <CardDescription className="flex min-w-0 items-center">
                  {item.description.length > 200
                    ? item.description.slice(0, 200) + "..."
                    : item.description || "No description"}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FiltersUI({
  filters,
  setFilters,
  applyFilters,
}: {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  applyFilters: () => void;
}) {
  return (
    <>
      <div className="flex gap-0.5">
        <Input
          placeholder="Search by name"
          className="rounded-none border-0 border-b-2 border-muted-foreground! bg-transparent! text-muted-foreground ring-0! transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground! focus-visible:text-foreground focus-visible:placeholder:text-muted-foreground"
          value={filters.name}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />

        <Button size="icon-sm" variant="ghost" onClick={applyFilters}>
          <Search />
        </Button>
      </div>

      {/* Genders */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="group w-full">
            <span className="capitalize">
              Gender:{" "}
              {filters.gender.length === 0 ||
              filters.gender.length === genders.length
                ? "All"
                : filters.gender.join(", ")}
            </span>
            <ChevronRight className="ml-auto group-data-[state=open]:rotate-90" />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 p-2.5 pt-0 text-sm">
          <ToggleGroup
            type="multiple"
            spacing={2}
            variant="outline"
            value={filters.gender}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                gender: value as Schema<"GenderTarget">[],
              }))
            }
          >
            {genders.map((gender) => (
              <ToggleGroupItem
                key={gender}
                value={gender}
                className="capitalize"
              >
                {gender}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CollapsibleContent>
      </Collapsible>

      {/* Categories */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="group w-full">
            <span className="capitalize">
              Category:{" "}
              {filters.categories.length === 0 ||
              filters.categories.length === categories.length
                ? "All"
                : filters.categories.join(", ")}
            </span>
            <ChevronRight className="ml-auto group-data-[state=open]:rotate-90" />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 p-2.5 pt-0 text-sm">
          <ToggleGroup
            type="multiple"
            className="flex w-full flex-wrap"
            spacing={2}
            variant="outline"
            value={filters.categories}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                categories: value as Schema<"ClothingCategory">[],
              }))
            }
          >
            {categories.map((category) => (
              <ToggleGroupItem
                key={category}
                value={category}
                className="capitalize"
              >
                {category}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CollapsibleContent>
      </Collapsible>

      {/* Styles */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="group w-full">
            <span className="capitalize">
              Styles:{" "}
              {filters.styles.length === 0 ||
              filters.styles.length === styles.length
                ? "All"
                : filters.styles.length > 3
                  ? filters.styles.slice(0, 3).join(", ") + "..."
                  : filters.styles.join(", ")}
            </span>
            <ChevronRight className="ml-auto group-data-[state=open]:rotate-90" />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 p-2.5 pt-0 text-sm">
          <ToggleGroup
            type="multiple"
            className="flex w-full flex-wrap"
            spacing={2}
            variant="outline"
            value={filters.styles}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                styles: value as Schema<"Style">[],
              }))
            }
          >
            {styles.map((style) => (
              <ToggleGroupItem key={style} value={style} className="capitalize">
                {style}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CollapsibleContent>
      </Collapsible>

      {/* Fit Types */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="group w-full">
            <span className="capitalize">
              Fit:{" "}
              {filters.fitTypes.length === 0 ||
              filters.fitTypes.length === fits.length
                ? "All"
                : filters.fitTypes.join(", ")}
            </span>
            <ChevronRight className="ml-auto group-data-[state=open]:rotate-90" />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 p-2.5 pt-0 text-sm">
          <ToggleGroup
            type="multiple"
            className="flex w-full flex-wrap"
            spacing={2}
            variant="outline"
            value={filters.fitTypes}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                fitTypes: value as Schema<"Fit">[],
              }))
            }
          >
            {fits.map((fit) => (
              <ToggleGroupItem key={fit} value={fit} className="capitalize">
                {fit}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CollapsibleContent>
      </Collapsible>

      {/* Colors */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="group w-full">
            <span className="capitalize">
              Colors:{" "}
              {filters.colors.length === 0 ||
              filters.colors.length === colors.length
                ? "All"
                : filters.colors.length > 3
                  ? filters.colors.slice(0, 3).join(", ") + "..."
                  : filters.colors.join(", ")}
            </span>
            <ChevronRight className="ml-auto group-data-[state=open]:rotate-90" />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 p-2.5 pt-0 text-sm">
          <ToggleGroup
            type="multiple"
            className="flex w-full flex-wrap"
            spacing={2}
            variant="outline"
            value={filters.colors}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                colors: value as Schema<"Color">[],
              }))
            }
          >
            {colors.map((color) => (
              <ToggleGroupItem key={color} value={color} className="capitalize">
                {color}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CollapsibleContent>
      </Collapsible>

      {/* Season */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="group w-full">
            <span className="capitalize">Season: {filters.season}</span>
            <ChevronRight className="ml-auto group-data-[state=open]:rotate-90" />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 p-2.5 pt-0 text-sm">
          <ToggleGroup
            type="single"
            className="flex w-full flex-wrap"
            spacing={2}
            variant="outline"
            value={filters.season}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                season: value as Schema<"Season">,
              }))
            }
          >
            {seasons.map((season) => (
              <ToggleGroupItem
                key={season}
                value={season}
                className="capitalize"
              >
                {season}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CollapsibleContent>
      </Collapsible>

      {/* Materials */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="group w-full">
            <span className="capitalize">
              Materials:{" "}
              {filters.materials.length === 0 ||
              filters.materials.length === materials.length
                ? "All"
                : filters.materials.length > 3
                  ? filters.materials.slice(0, 3).join(", ") + "..."
                  : filters.materials.join(", ")}
            </span>
            <ChevronRight className="ml-auto group-data-[state=open]:rotate-90" />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 p-2.5 pt-0 text-sm">
          <ToggleGroup
            type="multiple"
            className="flex w-full flex-wrap"
            spacing={2}
            variant="outline"
            value={filters.materials}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                materials: value as Schema<"Material">[],
              }))
            }
          >
            {materials.map((material) => (
              <ToggleGroupItem
                key={material}
                value={material}
                className="capitalize"
              >
                {material}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CollapsibleContent>
      </Collapsible>

      {/* Only in stock */}
      <FieldLabel>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>In stock</FieldTitle>
            <FieldDescription>
              {filters.onlyInStock &&
                "You will only see clothes for which we have your sizes in stock"}
              {!filters.onlyInStock &&
                "You may see clothes for which we do not have your sizes in stock"}
            </FieldDescription>
          </FieldContent>

          <Checkbox
            id="isActive"
            checked={filters.onlyInStock}
            onCheckedChange={(checked) =>
              setFilters((prev) => ({
                ...prev,
                onlyInStock: !!checked,
              }))
            }
          />
        </Field>
      </FieldLabel>

      {/* Strict filters */}
      <FieldLabel>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Strict filters</FieldTitle>
            <FieldDescription>
              {filters.strict &&
                "You will only see clothes that match all selected filters"}
              {!filters.strict &&
                "You will see clothes that match at least one of the selected filters"}
            </FieldDescription>
          </FieldContent>

          <Checkbox
            id="isActive"
            checked={filters.strict}
            onCheckedChange={(checked) =>
              setFilters((prev) => ({
                ...prev,
                strict: !!checked,
              }))
            }
          />
        </Field>
      </FieldLabel>

      <div className="mt-4 flex flex-row-reverse items-center justify-center gap-2 md:flex-col">
        <Button className="flex-1 md:w-full" onClick={applyFilters}>
          Apply Filters
        </Button>

        <Button
          className="flex-1 md:w-full"
          onClick={() => setFilters({ ...baseFilters })}
          variant="outline"
        >
          Reset filters
        </Button>
      </div>
    </>
  );
}
