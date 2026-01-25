import { RefObject, useCallback } from "react";
import { useEventListener } from "usehooks-ts";

export function useLeaveConfirmation(
  shouldConfirm: boolean | (() => boolean) | RefObject<boolean> = true,
) {
  const callback = useCallback(
    (e: BeforeUnloadEvent) => {
      if (typeof shouldConfirm === "function" && !shouldConfirm()) return;
      if (typeof shouldConfirm === "boolean" && !shouldConfirm) return;
      if (
        typeof shouldConfirm === "object" &&
        "current" in shouldConfirm &&
        !shouldConfirm.current
      )
        return;

      e.preventDefault();
      // Legacy support
      e.returnValue = "";
    },
    [shouldConfirm],
  );

  useEventListener("beforeunload", callback);
}
