import React, { useEffect, useState } from "react";
import moment from "moment";
import { CircularProgress, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts";

import { aggregatedPostsAnalytics } from "@/utils/analytics";

import { AnalyticsData, AnalyticsDataItem, PostsMap } from "@/utils/types/misc";

const AnalyticsGraph = ({ postsMap }: { postsMap: PostsMap }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>();

  const [error, setError] = useState<boolean>(false);
  const [empty, setEmpty] = useState<boolean>(false);

  const getAnalyticsData = async () => {
    if (postsMap) {
      aggregatedPostsAnalytics(postsMap)
        .then((res) => {
          const dataMap: Record<string, AnalyticsDataItem> = {};
          if (res?.length) {
            res.flat().forEach((obj) => {
              const jsDate = moment(obj?.time)?.toDate();
              const jsDateString = String(jsDate);
              const currentDataMapObj = dataMap[jsDateString];
              if (dataMap[jsDateString]) {
                dataMap[jsDateString] = {
                  ...obj,
                  positives:
                    currentDataMapObj.positives ?? 0 + obj?.positives ?? 0,
                  negatives:
                    currentDataMapObj.negatives ?? 0 + obj?.negatives ?? 0,
                  time: jsDate,
                };
              } else {
                dataMap[jsDateString] = { ...obj, time: jsDate };
              }
            });
            setAnalyticsData(Object.values(dataMap));
          } else {
            setEmpty(true);
          }
        })
        .catch(setError);
    }
  };

  useEffect(() => {
    setAnalyticsData(undefined);
    getAnalyticsData();
  }, [postsMap]);

  if (analyticsData?.length) {
    return (
      <LineChart
        dataset={analyticsData}
        xAxis={[
          {
            dataKey: "time",
            label: "Past 7 days",
            scaleType: "time",
          },
        ]}
        series={[
          {
            dataKey: "positives",
            color: "lightgreen",
            label: "Positive Reactions",
          },
          {
            dataKey: "negatives",
            color: "pink",
            label: "Negative Reactions",
          },
        ]}
      />
    );
  } else if (error) {
    return (
      <Typography variant="caption" color="InfoText">
        Something went wrong! Please Try again later
      </Typography>
    );
  } else if (empty) {
    return (
      <Typography variant="caption" color="InfoText">
        No Data Found!
      </Typography>
    );
  }
  return <CircularProgress />;
};

export default AnalyticsGraph;
