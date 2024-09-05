"use client";
import React from "react";
import { Paper, Button, Divider, Typography, Box } from "@mui/material";
import Image from "next/image";

import { channelColor } from "@/utils/constants";
import { addAlpha } from "@/utils/helpers";

import "./styles.scss";

const ChannelCard = ({
  title,
  icon,
  isOnline,
  pages,
  login,
  logout,
  onClick,
}: {
  title: string;
  icon: any;
  isOnline: boolean;
  pages: any[];
  login: Function;
  logout: Function;
  onClick: Function;
}) => {
  return (
    <Paper
      className="channelBox"
      onClick={() => onClick()}
      style={{
        backgroundColor: addAlpha(
          channelColor[title?.toLowerCase()] ?? "#000",
          0.36
        ),
      }}
    >
      {/* absolute position */}
      <div
        className="statusBadge"
        style={{
          backgroundColor: isOnline ? "green" : "red",
        }}
      />
      {/* absolute position */}
      <Image src={icon} className="avatar" alt="avatar" />

      <Box className="details-container">
        <div className="title">
          <Typography variant="h6" className="titleText">
            {title}
          </Typography>
        </div>
        <Divider style={{ width: "100%" }} />
        <div className="details">
          {isOnline && (
            <Typography variant="body2" align="justify" color="green">
              Pages: {pages.length}
            </Typography>
          )}
        </div>
        <div className="button">
          <Button
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              isOnline ? logout() : login();
            }}
            color={isOnline ? "error" : "success"}
            size={isOnline ? "small" : "large"}
          >
            {isOnline ? "Disconnect" : "Connect"}
          </Button>
        </div>
      </Box>
    </Paper>
  );
};

export default ChannelCard;
