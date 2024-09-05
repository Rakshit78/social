import React from "react";
import { Box, Button, Card, Divider, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";

import "./styles.scss";

type Props = {
  items: Record<"text" | "date", string>[];
  closeModal: Function;
};

const CalendarModalContent = ({ items, closeModal }: Props) => {
  return (
    <Box className="calendar-modal-container">
      <div className="close">
        <Button onClick={() => closeModal()}>
          <Close color="error" />
        </Button>
      </div>
      {items.map((val) => (
        <Card key={val.date} className="item-container">
          <Typography>{val.text}</Typography>
          <Divider style={{ width: "100%" }} />
          <Typography variant="caption">{val.date}</Typography>
        </Card>
      ))}
    </Box>
  );
};

export default CalendarModalContent;
