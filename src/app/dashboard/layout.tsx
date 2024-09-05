"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Tab, Tabs } from "@mui/material";
import {
  Campaign,
  CampaignOutlined,
  Home,
  HomeOutlined,
  Mail,
  MailOutline,
  Public,
  PublicOutlined,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

import Loading from "./loading";

import { useAuth } from "@/context/authContext";
import { useChannels } from "@/context/channelsContext";

import { ChannelsState } from "@/utils/types/context";
import { ChannelsEnum, FacebookChannelType } from "@/utils/types/channels";

import { useWindowDimensions } from "@/utils/hooks";
import { hasJWTExpired } from "@/utils/helpers";

import "./styles.scss";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { channelsState, setChannelsState } = useChannels();
  const { user } = useAuth();

  const { windowWidth } = useWindowDimensions();

  const isAnyChannelConnected = Object.values(channelsState).some(
    (channel) => channel?.token
  );

  const router = useRouter();

  const pathname = usePathname();

  const dashboardPathnameRoot = pathname?.split("/").slice(0, 3).join("/");

  const sidebarContent = [
    {
      title: "Home",
      hide: false,
      icon:
        dashboardPathnameRoot === "/dashboard" ? <HomeOutlined /> : <Home />,
      link: "/dashboard",
    },
    {
      title: "Campaigns",
      hide: false,
      icon:
        dashboardPathnameRoot === "/dashboard/campaigns" ? (
          <CampaignOutlined />
        ) : (
          <Campaign />
        ),
      link: "/dashboard/campaigns",
    },
    {
      title: "Posts",
      hide: !isAnyChannelConnected,
      icon:
        dashboardPathnameRoot === "/dashboard/posts" ? (
          <Mail />
        ) : (
          <MailOutline />
        ),
      link: "/dashboard/posts",
    },

    {
      title: "Channels",
      hide: false,
      icon:
        dashboardPathnameRoot === "/dashboard/channels" ? (
          <Public />
        ) : (
          <PublicOutlined />
        ),
      link: "/dashboard/channels",
    },
  ];

  useEffect(() => {
    if (user?.uid) {
      const localChannelsState = window.sessionStorage.getItem(user.uid);
      if (localChannelsState) {
        const parsedLocalChannelsState = JSON.parse(localChannelsState);
        const nonExpiredChannelsStateObj = {} as ChannelsState;
        Object.entries(parsedLocalChannelsState).forEach((entry) => {
          const [channel, obj] = entry as [ChannelsEnum, FacebookChannelType];
          if (obj?.token) {
            if (channel === "facebook") {
              // to do: handle expiries separately
              if (obj.createdAt) {
                const currentTime = new Date();
                const targetTime = new Date(obj.createdAt);
                const timeDifferenceInMilliseconds =
                  currentTime.getTime() - targetTime.getTime();
                const timeDifferenceInMinutes =
                  timeDifferenceInMilliseconds / 1000 / 60;

                if (timeDifferenceInMinutes < 55) {
                  // add token only if it's not mre  than 55mins as fb short lived tokens expire in 60 mins
                  nonExpiredChannelsStateObj[channel] = obj;
                }
              }
            } else if (!hasJWTExpired(obj.token)) {
              nonExpiredChannelsStateObj[channel] = obj;
            }
          }
        });
        setChannelsState(nonExpiredChannelsStateObj);
      }
    }
  }, [user?.uid]);

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div className="dashboard">
        <Tabs
          value={dashboardPathnameRoot}
          orientation={windowWidth > 650 ? "vertical" : "horizontal"}
          variant="scrollable"
          className="navigation"
        >
          {sidebarContent.map(
            (content) =>
              !content.hide && (
                <Tab
                  key={content.link}
                  value={content.link}
                  onClick={() => router.push(content.link)}
                  className="tab"
                  icon={content.icon}
                  label={content.title}
                />
              )
          )}
        </Tabs>

        <Suspense fallback={<Loading />} unstable_expectedLoadTime={10000}>
          <main className="content" key={pathname}>
            {children}
          </main>
        </Suspense>
      </div>
    </LocalizationProvider>
  );
}
