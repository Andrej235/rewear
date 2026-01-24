"use client";
import { toTitleCase } from "@repo/lib/utils/title-case";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/common/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/common/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

type TBreadcrumbItem = {
  link: string;
  name: string;
};

export function AdminHeaderBreadcrumbs() {
  const pathname = usePathname();
  const pieces = pathname.replace("/admin", "").split("/").filter(Boolean);
  const items: TBreadcrumbItem[] =
    pieces.length === 0
      ? [
          {
            link: "/",
            name: "Dashboard",
          },
        ]
      : pieces.reduce<TBreadcrumbItem[]>(
          (acc, item) => [
            ...acc,
            {
              link: (acc[acc.length - 1]?.link ?? "/admin") + "/" + item,
              name: toTitleCase(item.replace(/-/g, " ")),
            },
          ],
          [],
        );

  return (
    <>
      <Breadcrumb className="hidden md:block">
        <BreadcrumbList>
          {items.map((item, index) =>
            index !== items.length - 1 ? (
              [
                <BreadcrumbItem key={item.link}>
                  <BreadcrumbLink asChild>
                    <Link href={item.link}>{item.name}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>,
                <BreadcrumbSeparator key={item.link + "-separator"} />,
              ]
            ) : (
              <BreadcrumbItem key={item.link}>
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              </BreadcrumbItem>
            ),
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <Breadcrumb className="md:hidden">
        <BreadcrumbList>
          {items.length > 2 && (
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                  <span className="sr-only">Show menu</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                  {items.slice(0, -1).map((item) => (
                    <Link href={item.link} key={item.link}>
                      <DropdownMenuItem>{item.name}</DropdownMenuItem>
                    </Link>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          )}

          {items.length === 2 && (
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={items[0]!.link}>{items[0]!.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}

          {items.length > 1 && <BreadcrumbSeparator />}

          <BreadcrumbItem key={items[items.length - 1]?.link}>
            <BreadcrumbPage>{items[items.length - 1]?.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
