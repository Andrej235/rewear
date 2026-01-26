import { cn } from "@repo/lib/cn";
import { ChevronDownIcon } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../common/alert-dialog";
import { Button } from "../common/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../common/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "../common/field";

export type SetupFormStep3Data = {
  topSizes: string[];
  bottomWaistSizes: string[];
  bottomLengthSizes: string[];
  shoeSize: string[];
};

export function SetupFormStep3({
  advance,
  back,
  data: formData,
  setData: setFormData,
}: {
  advance: () => void;
  back: () => void;
  data: SetupFormStep3Data;
  setData: (
    setter:
      | SetupFormStep3Data
      | ((prev: SetupFormStep3Data) => SetupFormStep3Data),
  ) => void;
}) {
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      formData.topSizes.length === 0 ||
      formData.bottomWaistSizes.length === 0 ||
      formData.bottomLengthSizes.length === 0 ||
      formData.shoeSize.length === 0
    ) {
      setLeaveDialogOpen(true);
      return;
    }

    advance();
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Field>
          <FieldLabel>What top sizes do you wear?</FieldLabel>

          <MultiSelect
            options={["XS", "S", "M", "L", "XL", "XXL"]}
            selected={formData.topSizes}
            setSelected={(selected) =>
              setFormData((prev) => ({ ...prev, topSizes: selected }))
            }
          />
        </Field>

        <Field>
          <FieldLabel>What bottom waist sizes do you wear?</FieldLabel>

          <MultiSelect
            options={["28", "30", "32", "34", "36", "38", "40", "42"]}
            selected={formData.bottomWaistSizes}
            setSelected={(selected) =>
              setFormData((prev) => ({
                ...prev,
                bottomWaistSizes: selected,
              }))
            }
          />
        </Field>

        <Field>
          <FieldLabel>What bottom length sizes do you wear?</FieldLabel>

          <MultiSelect
            options={["30", "32", "34", "36"]}
            selected={formData.bottomLengthSizes}
            setSelected={(selected) =>
              setFormData((prev) => ({
                ...prev,
                bottomLengthSizes: selected,
              }))
            }
          />
        </Field>

        <Field>
          <FieldLabel>What shoe sizes do you wear?</FieldLabel>

          <MultiSelect
            options={Array.from({ length: 15 }).map((_, i) =>
              (i + 35).toString(),
            )}
            selected={formData.shoeSize}
            setSelected={(selected) =>
              setFormData((prev) => ({ ...prev, shoeSize: selected }))
            }
          />
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

      <AlertDialog
        open={leaveDialogOpen}
        onOpenChange={() => setLeaveDialogOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to continue without choosing all sizes?
            </AlertDialogTitle>

            <AlertDialogDescription>
              We won't be able to guarantee that we have clothes in stock that
              fit you when making recommendations.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={advance}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function MultiSelect({
  options,
  selected,
  setSelected,
}: {
  options: string[];
  selected: string[];
  setSelected: (selected: string[]) => void;
}) {
  const value = useMemo(() => selected.join(", "), [selected]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
          !value && "text-muted-foreground",
        )}
      >
        <span>{value || "Select size(s)"}</span>
        <ChevronDownIcon className="size-4 opacity-50" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            checked={selected.includes(option)}
            onCheckedChange={(checked) => {
              setSelected(
                checked
                  ? [...selected, option]
                  : selected.filter((s) => s !== option),
              );
            }}
            key={option}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
