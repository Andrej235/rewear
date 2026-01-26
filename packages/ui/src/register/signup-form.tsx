"use client";
import { RegistrationStep2Data } from "@/register/registration-step-2";
import { Api } from "@repo/lib/api/api";
import { cn } from "@repo/lib/cn";
import { LinkComp } from "@repo/lib/types/link-comp";
import { Navigate } from "@repo/lib/types/navigate";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../common/card";
import { RegistrationStep1 } from "./registration-step-1";
import { RegistrationStep2 } from "./registration-step-2";
import {
  RegistrationStep3,
  RegistrationStep3Data,
} from "./registration-step-3";
import {
  RegistrationStep4,
  RegistrationStep4Data,
} from "./registration-step-4";
import { RegistrationStep5 } from "./registration-step-5";

export function SignupForm({
  className,
  api,
  LinkComp: Link,
}: {
  className?: string;
  api: Api;
  navigate: Navigate;
  LinkComp: LinkComp;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const description = useMemo(() => {
    switch (currentStep) {
      case 1:
        return "Enter your information below to create your account";
      case 2:
        return "Tell us what you like to wear so we can provide you with better recommendations";
      case 3:
        return "Tell us what you like to wear so we can provide you with better recommendations";
      case 4:
        return "Tell us what sizes you wear so we can only recommend clothes that we have in stock";
      case 5:
        return "Choose a subscription plan that fits your needs";
      default:
        return "Create your account";
    }
  }, [currentStep]);

  const emailRef = useRef<string | null>(null);

  const [step2Data, setStep2Data] = useState<RegistrationStep2Data>({
    gender: "male",
    primaryStyle: "casual",
    secondaryStyles: [],
    fit: "regular",
    season: "all",
  });

  const [step3Data, setStep3Data] = useState<RegistrationStep3Data>({
    preferredColors: [],
    avoidedColors: [],
    avoidedMaterials: [],
  });

  const [step4Data, setStep4Data] = useState<RegistrationStep4Data>({
    topSizes: [],
    bottomWaistSizes: [],
    bottomLengthSizes: [],
    shoeSize: [],
  });

  async function handleCompleteRegistration(selectedPlanId: number) {
    if (!emailRef.current) {
      toast.error("Something went wrong. Please start the registration again.");
      return;
    }

    const { isOk } = await api.sendRequest(
      "/users/complete-registration",
      {
        method: "put",
        payload: {
          email: emailRef.current,

          gender: step2Data.gender,
          primaryStyle: step2Data.primaryStyle,
          secondaryStyles: step2Data.secondaryStyles,
          fitPreference: step2Data.fit,
          seasonPreference: step2Data.season,

          preferredColors: step3Data.preferredColors,
          avoidedColors: step3Data.avoidedColors,
          avoidedMaterials: step3Data.avoidedMaterials,

          sizes: [
            ...step4Data.topSizes.map((x) => ({
              sizeType: "top" as const,
              label: x,
            })),
            ...step4Data.bottomWaistSizes.map((x) => ({
              sizeType: "bottom_waist" as const,
              label: x,
            })),
            ...step4Data.bottomLengthSizes.map((x) => ({
              sizeType: "bottom_length" as const,
              label: x,
            })),
            ...step4Data.shoeSize.map((x) => ({
              sizeType: "shoe" as const,
              label: x,
            })),
          ],
          subscriptionPlanId: selectedPlanId,
        },
      },
      {
        toasts: {
          loading: "Creating your account...",
          success: "Account created successfully!",
          error: (e) =>
            e.message || "Failed to create account. Please try again.",
        },
      },
    );

    if (!isOk) return;
  }

  return (
    <Card
      className={cn(
        "max-h-[70vh] w-full max-w-[90vw] sm:w-auto sm:min-w-lg",
        currentStep !== 5 && "lg:max-w-lg",
        className,
      )}
    >
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="overflow-auto">
        {currentStep === 1 && (
          <RegistrationStep1
            api={api}
            Link={Link}
            advance={(x) => {
              emailRef.current = x;
              setCurrentStep(2);
            }}
          />
        )}

        {currentStep === 2 && (
          <RegistrationStep2
            advance={() => setCurrentStep(3)}
            data={step2Data}
            setData={setStep2Data}
          />
        )}

        {currentStep === 3 && (
          <RegistrationStep3
            back={() => setCurrentStep(2)}
            advance={() => setCurrentStep(4)}
            data={step3Data}
            setData={setStep3Data}
          />
        )}

        {currentStep === 4 && (
          <RegistrationStep4
            back={() => setCurrentStep(3)}
            advance={() => setCurrentStep(5)}
            data={step4Data}
            setData={setStep4Data}
          />
        )}

        {currentStep === 5 && (
          <RegistrationStep5
            api={api}
            advance={handleCompleteRegistration}
            back={() => setCurrentStep(4)}
          />
        )}
      </CardContent>
    </Card>
  );
}
