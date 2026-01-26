"use client";
import { Api } from "@repo/lib/api/api";
import { useQuery } from "@repo/lib/api/use-query";
import { cn } from "@repo/lib/cn";
import { CheckCircle, XCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { Badge } from "../common/badge";
import { Button } from "../common/button";
import { Field, FieldGroup } from "../common/field";
import { LoadingScreen } from "../loading-screen";

export function SetupFormStep4({
  api,
  advance,
  back,
}: {
  api: Api;
  advance: (selectedPlanId: number) => void;
  back: () => void;
}) {
  const plansQuery = useQuery(api, "/subscription-plans/all", {
    queryKey: ["subscription-plans"],
  });
  const plans = !plansQuery.data
    ? []
    : plansQuery.data
        .slice(0, 3)
        .sort((a, b) => a.monthlyPrice - b.monthlyPrice);

  const [selected, setSelected] = useState(1);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!plansQuery.data) return;

    advance(plans[selected]!.id);
  }

  if (plansQuery.isLoading) return <LoadingScreen />;

  if (plansQuery.isError) return <div>Error loading plans</div>;

  return (
    <form
      className="grid w-full gap-6 p-6 lg:grid-cols-3"
      onSubmit={handleSubmit}
    >
      {plans.map((plan, i) => (
        <button
          key={plan.name}
          type="button"
          className={cn(
            "flex flex-col gap-4 rounded-md border border-border px-12 py-6 transition-all ease-out hover:border-primary/50 hover:bg-accent/30",
            i === selected && "border-primary bg-primary/30 lg:-translate-y-2",
          )}
          onClick={() => setSelected(i)}
        >
          <h3 className="flex items-center justify-center gap-2 text-xl font-bold">
            <span>{plan.name}</span>
            {i === 1 && <Badge>Popular</Badge>}
          </h3>

          <div>
            <p className="text-3xl font-bold">${plan.monthlyPrice}</p>
            <p className="text-sm text-muted-foreground">per month</p>
          </div>

          <ul className="mx-auto flex-1 space-y-2 text-sm lg:mx-0">
            <li className="flex items-center gap-2">
              <CheckCircle />

              <span>
                Max Items:{" "}
                <span className="font-semibold">{plan.maxItemsPerMonth}</span>
              </span>
            </li>
            <li className="flex items-center gap-2">
              {plan.allowsOuterwear && <CheckCircle />}
              {!plan.allowsOuterwear && <XCircle />}
              <span>Outerwear</span>
            </li>
            <li className="flex items-center gap-2">
              {plan.allowsShoes && <CheckCircle />}
              {!plan.allowsShoes && <XCircle />}
              <span>Shoes</span>
            </li>
          </ul>
        </button>
      ))}

      <FieldGroup className="flex-row gap-2 lg:col-start-2 lg:col-end-3">
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
