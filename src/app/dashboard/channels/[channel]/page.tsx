"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Breadcrumbs, Toolbar, Typography, Button } from "@mui/material";
import { ReportGmailerrorredOutlined } from "@mui/icons-material";

import PageCard from "./components/pageCard";

import { channelColor } from "@/utils/constants";
import { useChannels } from "@/context/channelsContext";
import { ChannelsEnum } from "@/utils/types/channels";

import "./styles.scss";

const Page = () => {
  const { channel } = useParams<{ channel: ChannelsEnum }>();

  const router = useRouter();

  const { channelsState } = useChannels();

  const { pages, token } = channelsState?.[channel] || {};

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <Button onClick={router.back}>Channels</Button>
        <Typography>{channel.toLocaleUpperCase()}</Typography>
      </Breadcrumbs>
      <Toolbar
        className="toolbar"
        sx={{
          backgroundColor: channelColor?.[channel],
        }}
      >
        <Typography variant="h5" className="title">
          {channel.toString().toLocaleUpperCase()}
        </Typography>
      </Toolbar>

      <div className="pages-section">
        {pages?.length ? (
          <div className="pages-listing">
            {pages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        ) : (
          <div className="error">
            <ReportGmailerrorredOutlined />
            <Typography variant="body2">Pages List is empty</Typography>
          </div>
        )}
        {!token && (
          <div className="login-message">
            You got logged out of {channel}. Please{" "}
            <Button onClick={router.back}>Go back</Button> and login again to
            continue
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
