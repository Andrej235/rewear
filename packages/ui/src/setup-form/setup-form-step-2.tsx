import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "../common/button";
import { Field, FieldGroup, FieldLabel } from "../common/field";
import { ToggleGroup, ToggleGroupItem } from "../common/toggle-group";

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

export type SetupFormStep2Data = {
  preferredColors: Schema<"Color">[];
  avoidedColors: Schema<"Color">[];
  avoidedMaterials: Schema<"Material">[];
};

export function SetupFormStep2({
  advance,
  back,
  data: formData,
  setData: setFormData,
}: {
  advance: () => void;
  back: () => void;
  data: SetupFormStep2Data;
  setData: (
    setter:
      | SetupFormStep2Data
      | ((prev: SetupFormStep2Data) => SetupFormStep2Data),
  ) => void;
}) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      formData.avoidedColors.some((color) =>
        formData.preferredColors.includes(color),
      )
    ) {
      toast.error("Preferred colors and avoided colors cannot overlap.");
      return;
    }

    if (formData.avoidedMaterials.length === materials.length) {
      toast.error("You must leave at least one material viable.");
      return;
    }

    advance();
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Field>
        <ToggleGroup
          type="multiple"
          value={formData.preferredColors}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              preferredColors: value as Schema<"Color">[],
            })
          }
          spacing={2}
          variant="outline"
          className="flex-wrap"
        >
          <FieldLabel className="max-w-max">
            My favorite colors include:
          </FieldLabel>

          {colors.map((color) => (
            <ToggleGroupItem key={color} value={color} className="capitalize">
              {color}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Field>
        <ToggleGroup
          type="multiple"
          value={formData.avoidedColors}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              avoidedColors: value as Schema<"Color">[],
            })
          }
          spacing={2}
          variant="outline"
          className="flex-wrap"
        >
          <FieldLabel className="max-w-max">
            Colors I prefer to avoid:
          </FieldLabel>

          {colors.map((color) => (
            <ToggleGroupItem key={color} value={color} className="capitalize">
              {color}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Field>
        <ToggleGroup
          type="multiple"
          value={formData.avoidedMaterials}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              avoidedMaterials: value as Schema<"Material">[],
            })
          }
          spacing={2}
          variant="outline"
          className="flex-wrap"
        >
          <FieldLabel className="max-w-max">
            Materials I wish to avoid:
          </FieldLabel>

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

      <FieldGroup className="flex-row gap-2">
        <Field>
          <Button type="button" onClick={back}>
            Back
          </Button>
        </Field>

        <Field>
          <Button type="submit">Next</Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
