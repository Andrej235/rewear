import { LinkComp } from "@repo/lib/types/link-comp";
import { Link as RRLink } from "react-router";

export const Link: LinkComp = ({ href, ...props }) => {
  return <RRLink to={href} {...props} />;
};
