import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { Checkbox } from "@repo/ui/common/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@repo/ui/common/field";
import { Input } from "@repo/ui/common/input";
import { Separator } from "@repo/ui/common/separator";
import { Textarea } from "@repo/ui/common/textarea";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/common/toggle-group";
import Image from "next/image";

type Props = {
  clothingItem: Schema<"CreateClothingItemRequestDto">;
  setClothingItem: (
    setter:
      | Schema<"CreateClothingItemRequestDto">
      | ((
          old: Schema<"CreateClothingItemRequestDto">,
        ) => Schema<"CreateClothingItemRequestDto">),
  ) => void;

  imageUrl: string | null;
  setImageFile: (file: File | null) => void;
};

const categories: Schema<"ClothingCategory">[] = [
  "bottom",
  "footwear",
  "top",
  "outerwear",
  "none",
];

const genderTargets: Schema<"GenderTarget">[] = [
  "female",
  "male",
  "unisex",
  "none",
];

const styles: Schema<"Style">[] = [
  "none",
  "minimal",
  "streetwear",
  "casual",
  "formal",
  "sporty",
  "classic",
  "business",
];

const fits: Schema<"Fit">[] = ["slim", "regular", "loose", "none"];

const colors: Schema<"Color">[] = [
  "none",
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
  "none",
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

export function ClothingItemEditor({
  clothingItem: formData,
  setClothingItem: setFormData,
  imageUrl,
  setImageFile,
}: Props) {
  return (
    <>
      <FieldSet>
        <FieldLegend>Basic Information</FieldLegend>

        <FieldGroup className="lg:flex-row">
          <div className="flex flex-col gap-4 lg:flex-2/3">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                autoComplete="off"
                placeholder="White T-Shirt"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                autoComplete="off"
                rows={6}
                placeholder="A comfortable white t-shirt made from organic cotton."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Field>
          </div>

          <Field className="lg:flex-1/3">
            <FieldLabel htmlFor="image">Image</FieldLabel>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            {imageUrl && (
              <Image
                src={imageUrl}
                alt="Preview"
                className="mx-auto mt-4 size-64 max-w-64 rounded border object-contain"
                width={256}
                height={256}
              />
            )}
          </Field>
        </FieldGroup>
      </FieldSet>

      <Separator className="my-8" />

      <FieldSet>
        <FieldLegend>Details</FieldLegend>

        <div className="grid gap-7 xl:grid-cols-2">
          <div className="flex flex-col gap-7">
            {/* Brand, target gender */}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="brandName">Brand Name</FieldLabel>

                <Input
                  id="brandName"
                  autoComplete="off"
                  placeholder="Brand XYZ"
                  value={formData.brandName}
                  onChange={(e) =>
                    setFormData({ ...formData, brandName: e.target.value })
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="genderTarget">Gender Target</FieldLabel>
                <ToggleGroup
                  type="single"
                  id="genderTarget"
                  className="w-full"
                  variant="outline"
                  spacing={2}
                  onValueChange={(x) =>
                    setFormData({
                      ...formData,
                      genderTarget: x as Schema<"GenderTarget">,
                    })
                  }
                  value={formData.genderTarget}
                >
                  {genderTargets.map((target) => (
                    <ToggleGroupItem
                      key={target}
                      value={target}
                      className="capitalize"
                    >
                      {target}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            </FieldGroup>

            {/* Category, fit */}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>

                <ToggleGroup
                  type="single"
                  id="category"
                  className="w-full"
                  variant="outline"
                  spacing={2}
                  onValueChange={(x) =>
                    setFormData({
                      ...formData,
                      category: x as Schema<"ClothingCategory">,
                    })
                  }
                  value={formData.category}
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
              </Field>

              <Field>
                <FieldLabel htmlFor="fitType">Fit Type</FieldLabel>

                <ToggleGroup
                  type="single"
                  id="fitType"
                  className="w-full"
                  variant="outline"
                  spacing={2}
                  onValueChange={(x) =>
                    setFormData({
                      ...formData,
                      fitType: x as Schema<"Fit">,
                    })
                  }
                  value={formData.fitType}
                >
                  {fits.map((fit) => (
                    <ToggleGroupItem
                      key={fit}
                      value={fit}
                      className="capitalize"
                    >
                      {fit}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            </FieldGroup>

            {/* Colors */}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="colors">Colors</FieldLabel>

                <ToggleGroup
                  type="multiple"
                  id="colors"
                  className="w-full flex-wrap"
                  variant="outline"
                  spacing={2}
                  onValueChange={(x) =>
                    setFormData({
                      ...formData,
                      colors: x as Schema<"Color">[],
                    })
                  }
                  value={formData.colors}
                >
                  {colors.slice(1).map((color) => (
                    <ToggleGroupItem
                      key={color}
                      value={color}
                      className="capitalize"
                    >
                      {color}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            </FieldGroup>
          </div>

          <div className="flex flex-col gap-7">
            {/* Styles */}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="primaryStyle">Primary Style</FieldLabel>

                <ToggleGroup
                  type="single"
                  id="primaryStyle"
                  className="w-full flex-wrap"
                  variant="outline"
                  onValueChange={(x) =>
                    setFormData({
                      ...formData,
                      primaryStyle: x as Schema<"Style">,
                    })
                  }
                  value={formData.primaryStyle}
                  spacing={2}
                >
                  {styles.map((style) => (
                    <ToggleGroupItem
                      key={style}
                      value={style}
                      className="capitalize"
                    >
                      {style}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="secondaryStyles">
                  Secondary Styles
                </FieldLabel>

                <ToggleGroup
                  type="multiple"
                  id="secondaryStyles"
                  className="w-full flex-wrap"
                  variant="outline"
                  onValueChange={(x) =>
                    setFormData({
                      ...formData,
                      secondaryStyles: x as Schema<"Style">[],
                    })
                  }
                  value={formData.secondaryStyles}
                  spacing={2}
                >
                  {styles.slice(1).map((style) => (
                    <ToggleGroupItem
                      key={style}
                      value={style}
                      className="capitalize"
                    >
                      {style}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            </FieldGroup>

            {/* Season, material */}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="season">Season</FieldLabel>

                <ToggleGroup
                  type="single"
                  id="season"
                  className="w-full"
                  variant="outline"
                  spacing={2}
                  onValueChange={(x) =>
                    setFormData({
                      ...formData,
                      season: x as Schema<"Season">,
                    })
                  }
                  value={formData.season}
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
              </Field>

              <Field>
                <FieldLabel htmlFor="material">Material</FieldLabel>

                <ToggleGroup
                  type="single"
                  id="material"
                  className="w-full flex-wrap"
                  variant="outline"
                  spacing={2}
                  onValueChange={(x) =>
                    setFormData({
                      ...formData,
                      material: x as Schema<"Material">,
                    })
                  }
                  value={formData.material}
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
              </Field>
            </FieldGroup>

            {/* Active */}
            <FieldLabel>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Make this item available to users?</FieldTitle>
                  <FieldDescription>
                    If disabled, the clothing item will not be visible in the
                    store even if it is in stock. You will always be able to
                    change this later.
                  </FieldDescription>
                </FieldContent>

                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isActive: !!checked,
                    })
                  }
                />
              </Field>
            </FieldLabel>
          </div>
        </div>
      </FieldSet>
    </>
  );
}
