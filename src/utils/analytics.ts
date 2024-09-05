import { fbGetPostInsights } from "./facebookSDK";
import { timeLines } from "./constants";

import { PostsMap } from "./types/misc";

export const aggregatedPostsAnalytics = (
  postsMap: PostsMap,
  timeLine = timeLines.daily
) => {
  // todo for channels other than facebook and aggregated data
  const channelPostAnalyticsFnMap = {
    facebook: fbGetPostInsights,
    linkedin: null,
  };

  return Promise.all(
    Object.entries(postsMap)?.map((entry) => {
      const [id, { token, channel }] = entry;
      const theFn = channelPostAnalyticsFnMap[channel];
      if (theFn) {
        return theFn(id, token, timeLine);
      }
    })
  );
};
