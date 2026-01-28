"use client";
import { Api } from "@repo/lib/api/api";
import { cn } from "@repo/lib/cn";
import { Navigate } from "@repo/lib/types/navigate";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../common/card";
import { SetupFormStep1, SetupFormStep1Data } from "./setup-form-step-1";
import { SetupFormStep2, SetupFormStep2Data } from "./setup-form-step-2";
import { SetupFormStep3, SetupFormStep3Data } from "./setup-form-step-3";
import { SetupFormStep4 } from "./setup-form-step-4";

export function SetupForm({
  className,
  api,
  navigate,
}: {
  className?: string;
  api: Api;
  navigate: Navigate;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const description = useMemo(() => {
    switch (currentStep) {
      case 1:
        return "Tell us what you like to wear so we can provide you with better recommendations";
      case 2:
        return "Tell us what you like to wear so we can provide you with better recommendations";
      case 3:
        return "Tell us what sizes you wear so we can only recommend clothes that we have in stock";
      case 4:
        return "Choose a subscription plan that fits your needs";
      default:
        return "Setup your account";
    }
  }, [currentStep]);

  const [step1Data, setStep1Data] = useState<SetupFormStep1Data>({
    gender: "male",
    primaryStyle: "casual",
    secondaryStyles: [],
    fit: "regular",
    season: "all",
  });

  const [step2Data, setStep2Data] = useState<SetupFormStep2Data>({
    preferredColors: [],
    avoidedColors: [],
    avoidedMaterials: [],
  });

  const [step3Data, setStep3Data] = useState<SetupFormStep3Data>({
    topSizes: [],
    bottomWaistSizes: [],
    bottomLengthSizes: [],
    shoeSize: [],
  });

  async function handleCompleteSetup(selectedPlanId: number) {
    const { isOk } = await api.sendRequest(
      "/users/setup-account",
      {
        method: "put",
        payload: {
          gender: step1Data.gender,
          primaryStyle: step1Data.primaryStyle,
          secondaryStyles: step1Data.secondaryStyles,
          fitPreference: step1Data.fit,
          seasonPreference: step1Data.season,

          preferredColors: step2Data.preferredColors,
          avoidedColors: step2Data.avoidedColors,
          avoidedMaterials: step2Data.avoidedMaterials,

          sizes: [
            ...step3Data.topSizes.map((x) => ({
              sizeType: "top" as const,
              label: x,
            })),
            ...step3Data.bottomWaistSizes.map((x) => ({
              sizeType: "bottomWaist" as const,
              label: x,
            })),
            ...step3Data.bottomLengthSizes.map((x) => ({
              sizeType: "bottomLength" as const,
              label: x,
            })),
            ...step3Data.shoeSize.map((x) => ({
              sizeType: "shoe" as const,
              label: x,
            })),
          ],
          subscriptionPlanId: selectedPlanId,
        },
      },
      {
        toasts: {
          loading: "Setting up your account...",
          success: "Account setup successfully!",
          error: (e) =>
            e.message || "Failed to setup your account. Please try again.",
        },
      },
    );

    if (!isOk) return;
    navigate("/");
  }

  return (
    <Card
      className={cn(
        "max-h-[70vh] w-full max-w-[90vw] sm:w-auto sm:min-w-lg",
        currentStep !== 4 && "lg:max-w-lg",
        className,
      )}
    >
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="overflow-auto">
        {currentStep === 1 && (
          <SetupFormStep1
            advance={() => setCurrentStep(2)}
            data={step1Data}
            setData={setStep1Data}
          />
        )}

        {currentStep === 2 && (
          <SetupFormStep2
            back={() => setCurrentStep(1)}
            advance={() => setCurrentStep(3)}
            data={step2Data}
            setData={setStep2Data}
          />
        )}

        {currentStep === 3 && (
          <SetupFormStep3
            back={() => setCurrentStep(2)}
            advance={() => setCurrentStep(4)}
            data={step3Data}
            setData={setStep3Data}
          />
        )}

        {currentStep === 4 && (
          <SetupFormStep4
            api={api}
            advance={handleCompleteSetup}
            back={() => setCurrentStep(3)}
          />
        )}
      </CardContent>
    </Card>
  );
}
