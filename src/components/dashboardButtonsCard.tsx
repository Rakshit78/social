"use client";

import React, { MouseEventHandler } from "react";
import { Card, Divider, Typography } from "@mui/material";
import { KeyboardArrowRightOutlined } from "@mui/icons-material";

import "./styles.scss";

const DashboardButtonsCard = ({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: MouseEventHandler<HTMLDivElement>;
}) => {
  return (
    <Card onClick={onClick} className="dashboard-buttons-card">
      <Typography variant="body1" className="title">
        {title}
      </Typography>
      <Divider style={{ width: "100%" }} />
      <div className="footer">
        <Typography variant="overline" className="subtitle">
          {subtitle}
        </Typography>
        <KeyboardArrowRightOutlined fontSize="medium" />
      </div>
    </Card>
  );
};

export default DashboardButtonsCard;
