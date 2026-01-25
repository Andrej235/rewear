import { Button } from "@repo/ui/common/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/common/dialog";
import { Input } from "@repo/ui/common/input";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { Camera, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  clothingItemId: string;
  setOpen: (open: boolean) => void;
  onScan: (inventoryItemId: string) => void;
};

export function InvQrCodeScannerDialog({ open, setOpen }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<
    "options" | "camera" | "upload" | "wrong-item"
  >("options");

  function handleOpenCamera() {
    let html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false,
    );
    html5QrcodeScanner.render(
      (res) => {
        toast.success("QR Code scanned: " + res);
      },
      (x) => {
        toast.error("QR Code scan error: " + x);
      },
    );
  }

  function handleOpenUpload() {
    setStep("upload");
  }

  async function handleUpload() {
    if (!fileInputRef.current) return;

    const file = fileInputRef.current.files?.[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode(/* element id */ "reader");
    html5QrCode
      .scanFile(file, true)
      .then((decodedText) => {
        // success, use decodedText
        console.log(decodedText);
      })
      .catch((err) => {
        // failure, handle it.
        console.log(`Error scanning file. Reason: ${err}`);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code Scanner</DialogTitle>
          <DialogDescription>
            Scan a QR code to find an inventory item.
          </DialogDescription>
        </DialogHeader>

        {step === "options" && (
          <div className="grid grid-cols-2 gap-4">
            <button
              className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded border bg-card/30 p-4"
              onClick={handleOpenCamera}
            >
              <Camera />
              <span className="text-sm">Open Camera</span>
            </button>

            <button
              className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded border bg-card/30 p-4"
              onClick={handleOpenUpload}
            >
              <Upload />
              <span className="text-sm">Upload Image</span>
            </button>
          </div>
        )}

        {step === "camera" && (
          <div id="reader" style={{ width: "600px" }}></div>
        )}

        {step === "upload" && (
          <div>
            <div id="reader" style={{ width: "600px" }}></div>

            <Input type="file" accept="image/*" ref={fileInputRef} />
            <Button className="mt-4 w-full" onClick={handleUpload}>
              Upload
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
