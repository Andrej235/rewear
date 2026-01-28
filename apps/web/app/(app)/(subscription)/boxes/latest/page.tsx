import { getLatestBox } from "../../../../../lib/get-latest-box";
import { pagePaddingX } from "../../../../../lib/page-padding";

export default async function LatestBoxPage() {
  const latestBox = await getLatestBox();

  return (
    <div className={pagePaddingX}>
      <p>{latestBox?.id}</p>
      <p>{latestBox?.items.length}</p>
    </div>
  );
}
