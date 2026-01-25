import { Button } from "@repo/ui/common/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/common/dialog";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2, Share2, X } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { toast } from "sonner";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  url: string;
};

export default function QRCodeDialog({ open, setOpen, url }: Props) {
  const qrCode = useQuery({
    queryKey: ["qrCode", url],
    enabled: open,
    queryFn: (): Promise<string | null> => {
      return new Promise((resolve) => {
        QRCode.toDataURL(url, { width: 500 }, (err, url) => {
          if (!err) {
            resolve(url);
            return;
          }

          toast.error(err.message);
          resolve(null);
        });
      });
    },
  });

  async function handleShare() {
    if (!qrCode.data) return;

    if (!navigator.canShare) {
      toast.error("Sharing is not supported on this device");
      return;
    }

    const res = await fetch(qrCode.data);
    const blob = await res.blob();
    const file = new File([blob], "qrcode.png", { type: "image/png" });

    if (!navigator.canShare({ files: [file] })) {
      toast.error("Sharing is not supported on this browser");
      return;
    }

    try {
      await navigator.share({
        title: `QR Code`,
        files: [file],
        url,
      });
    } catch (err) {
      console.error("Share failed:", err);
      toast.error("Share failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            This QR code leads to the following URL: <br />
            <span className="font-medium break-all">{url}</span>
          </DialogDescription>
        </DialogHeader>

        {qrCode.isLoading && <Loader2 className="mx-auto mt-32 animate-spin" />}

        {!qrCode.isLoading && qrCode.data && (
          <>
            <Image
              src={qrCode.data || ""}
              width={500}
              height={500}
              alt="QR kod"
              unoptimized
              className="rounded-md"
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button className="sm:w-max" variant="outline">
                  <span>Close</span>
                  <X className="size-4" />
                </Button>
              </DialogClose>

              <Button className="sm:w-max" asChild>
                <a href={qrCode.data} download={`qrcode.png`}>
                  <span>Download</span>
                  <Download className="size-4" />
                </a>
              </Button>

              <Button className="sm:w-max" onClick={handleShare}>
                <span>Share</span>
                <Share2 className="size-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {!qrCode.isLoading && !qrCode.data && (
          <p className="text-center">An error occurred, please try again</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
