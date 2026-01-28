import { format } from "date-fns";
import {
  PageAction,
  PageCard,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@repo/ui/common/page-card";
import { getBoxes } from "../../../../lib/get-boxes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/common/table";
import { Schema } from "@repo/lib/api/types/schema/schema-parser";
import { pagePaddingX } from "../../../../lib/page-padding";
import Link from "next/link";
import { Button } from "@repo/ui/common/button";
import { NewBoxButton } from "../../../../components/new-box-button";
import { Badge } from "@repo/ui/common/badge";

export default async function BoxesPage() {
  const boxes = await getBoxes();

  function renderStatus(status: Schema<"DeliveryBoxStatus">) {
    switch (status) {
      case "none":
        return <Badge>Unfinished</Badge>;

      case "preparing":
        return <Badge>Preparing</Badge>;

      case "shipping":
        return <Badge>Shipped</Badge>;

      case "returning":
        return <Badge>Delivered</Badge>;

      case "completed":
        return <Badge>Completed</Badge>;

      default:
        return <Badge>Unknown</Badge>;
    }
  }

  return (
    <PageCard className={pagePaddingX}>
      <PageHeader className="px-0!">
        <PageTitle>Your Boxes</PageTitle>
        <PageDescription>Manage your delivery boxes here</PageDescription>

        <PageAction>
          <NewBoxButton />
        </PageAction>
      </PageHeader>

      <PageContent className="px-0!">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/5">Month</TableHead>
              <TableHead className="w-1/5">Status</TableHead>
              <TableHead className="w-1/5">Item Count</TableHead>
              <TableHead className="w-1/5">Link</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {boxes?.map((box, i) => (
              <TableRow key={box.id}>
                <TableCell>{format(box.month, "MMMM yyyy")}</TableCell>
                <TableCell>{renderStatus(box.status)}</TableCell>
                <TableCell>{box.itemCount}</TableCell>
                <TableCell>
                  <Button asChild>
                    <Link href={i === 0 ? "/boxes/latest" : `/boxes/${box.id}`}>
                      View Details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageContent>
    </PageCard>
  );
}
