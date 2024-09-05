import React from "react";
import { Paper, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";

import "./styles.scss";

const EmptyBox = ({
  onClick,
  height,
  width,
}: {
  onClick: Function;
  height: string | number;
  width: string | number;
}) => {
  return (
    <Paper
      onClick={() => onClick()}
      className="emptyBox"
      style={{
        height,
        width,
      }}
    >
      <Add fontSize="large" />
      <Typography>Add a Channel</Typography>
    </Paper>
  );
};

export default EmptyBox;
