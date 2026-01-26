"use client";
import { RegistrationStep2Data } from "@/register/registration-step-2";
import { Api } from "@repo/lib/api/api";
import { LinkComp } from "@repo/lib/types/link-comp";
import { Navigate } from "@repo/lib/types/navigate";
import { useMemo, useState } from "react";
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
import { RegistrationStep4 } from "./registration-step-4";

export function SignupForm({
  className,
  api,
  navigate,
  LinkComp: Link,
}: {
  className?: string;
  api: Api;
  navigate: Navigate;
  LinkComp: LinkComp;
}) {
  const [currentStep, setCurrentStep] = useState(3);
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
    }
  }, [currentStep]);

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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {currentStep === 1 && (
          <RegistrationStep1
            api={api}
            Link={Link}
            advance={() => setCurrentStep(2)}
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
          />
        )}
      </CardContent>
    </Card>
  );
}
