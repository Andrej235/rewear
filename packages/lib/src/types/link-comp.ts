import { AnchorHTMLAttributes, ComponentType } from "react";

export type LinkComp = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }
>;
