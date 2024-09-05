import React, { useEffect, useState } from "react";
import { Card, Divider, Typography } from "@mui/material";
import { fbGetPageInsights } from "@/utils/facebookSDK";

import "./styles.scss";

interface CategoryListItem {
  id: string;
  name: string;
}

interface Page {
  access_token: string;
  category: string;
  category_list: CategoryListItem[];
  name: string;
  id: string;
  tasks: string[];
}

const PageCard = ({ page }: { page: Page }) => {
  const [impressions, setImpressions] = useState(0);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    fbGetPageInsights({ pageId: page.id, token: page.access_token }).then(
      (res) => {
        const _impressions = res?.data?.find(
          (insight: any) =>
            insight.name === "page_impressions" && insight.period === "days_28"
        )?.values[1]?.value;
        setImpressions(_impressions || 0);
        const _likes = res?.data?.find(
          (insight: any) => insight.name === "page_fans"
        )?.values[1]?.value;
        setLikes(_likes || 0);
      }
    );
  }, []);

  return (
    <Card className="page-card">
      <Typography variant="h6" className="title">
        {page.name}
      </Typography>
      <Divider style={{ width: "100%" }} />
      <div className="insights-container">
        <div className="insight">
          Total Page impressions
          <Typography className="number">{impressions}</Typography>
        </div>
        <div className="insight">
          Total Page likes<Typography className="number">{likes}</Typography>
        </div>
      </div>
    </Card>
  );
};

export default PageCard;
