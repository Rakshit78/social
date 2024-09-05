import React from "react";
import { Card, Chip, Typography } from "@mui/material";

import "./styles.scss";

type Props = {
  text: string;
};

const CalendarContentItem = ({ text }: Props) => {
  return (
    <div className="calendar-item">
      <Typography className="text" maxHeight={24}>
        {text}
      </Typography>
    </div>
  );
};

export default CalendarContentItem;
