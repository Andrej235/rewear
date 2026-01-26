import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "../common/button";
import { Field, FieldGroup, FieldLabel } from "../common/field";
import { ToggleGroup, ToggleGroupItem } from "../common/toggle-group";

const genders: Schema<"Gender">[] = ["male", "female", "other"];
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
const seasons: Schema<"Season">[] = ["all", "summer", "winter"];

export type SetupFormStep1Data = {
  gender: Schema<"Gender">;
  primaryStyle: Schema<"Style">;
  secondaryStyles: Schema<"Style">[];
  fit: Schema<"Fit">;
  season: Schema<"Season">;
};

export function SetupFormStep1({
  advance,
  data: formData,
  setData: setFormData,
}: {
  advance: () => void;
  data: SetupFormStep1Data;
  setData: (
    setter:
      | SetupFormStep1Data
      | ((prev: SetupFormStep1Data) => SetupFormStep1Data),
  ) => void;
}) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!formData.gender) {
      toast.error("Please select your gender.");
      return;
    }

    if (!formData.primaryStyle) {
      toast.error("Please select your primary style.");
      return;
    }

    if (!formData.season) {
      toast.error("Please select your favorite season.");
      return;
    }

    if (!formData.fit) {
      toast.error("Please select your prefered fit.");
      return;
    }

    if (formData.secondaryStyles.includes(formData.primaryStyle)) {
      setFormData({
        ...formData,
        secondaryStyles: formData.secondaryStyles.filter(
          (style) => style !== formData.primaryStyle,
        ),
      });
    }

    // Proceed to the next step
    advance();
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Field orientation="horizontal">
        <FieldLabel className="max-w-max">I identify as:</FieldLabel>

        <ToggleGroup
          type="single"
          value={formData.gender}
          onValueChange={(value) =>
            setFormData({ ...formData, gender: value as Schema<"Gender"> })
          }
          spacing={2}
          variant="outline"
        >
          {genders.map((gender) => (
            <ToggleGroupItem key={gender} value={gender} className="capitalize">
              {gender}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Field orientation="horizontal">
        <ToggleGroup
          type="single"
          value={formData.primaryStyle}
          onValueChange={(value) =>
            setFormData({ ...formData, primaryStyle: value as Schema<"Style"> })
          }
          spacing={2}
          variant="outline"
          className="flex-wrap"
        >
          <FieldLabel className="max-w-max">My primary style is:</FieldLabel>

          {styles.map((style) => (
            <ToggleGroupItem key={style} value={style} className="capitalize">
              {style}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Field>
        <ToggleGroup
          type="multiple"
          value={formData.secondaryStyles.filter(
            (style) => style !== formData.primaryStyle,
          )}
          onValueChange={(values) =>
            setFormData({
              ...formData,
              secondaryStyles: values as Schema<"Style">[],
            })
          }
          spacing={2}
          variant="outline"
          className="flex-wrap"
        >
          <span className="min-w-max">
            While my primary style is {formData.primaryStyle}, I also like to
            wear:{" "}
          </span>

          {styles.map((style) => (
            <ToggleGroupItem
              key={style}
              value={style}
              disabled={style === formData.primaryStyle}
              className="capitalize"
            >
              {style}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Field orientation="horizontal">
        <FieldLabel className="max-w-max">My favorite season is:</FieldLabel>
        <ToggleGroup
          type="single"
          value={formData.season}
          onValueChange={(value) =>
            setFormData({ ...formData, season: value as Schema<"Season"> })
          }
          spacing={2}
          variant="outline"
        >
          {seasons.map((season) => (
            <ToggleGroupItem key={season} value={season} className="capitalize">
              {season === "all" ? "all seasons" : season}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Field orientation="horizontal">
        <FieldLabel className="max-w-max">My prefered fit is:</FieldLabel>
        <ToggleGroup
          type="single"
          value={formData.fit}
          onValueChange={(value) =>
            setFormData({ ...formData, fit: value as Schema<"Fit"> })
          }
          spacing={2}
          variant="outline"
        >
          {fits.map((fit) => (
            <ToggleGroupItem key={fit} value={fit} className="capitalize">
              {fit}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <FieldGroup>
        <Field>
          <Button type="submit">Next</Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
