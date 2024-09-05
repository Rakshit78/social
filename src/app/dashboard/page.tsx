"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { onValue as dbOnValue } from "firebase/database";
import { LogoutOutlined } from "@mui/icons-material";

import DashboardButtonsCard from "@/components/dashboardButtonsCard";
import AnalyticsGraph from "@/components/analyticsGraph";

import { useAuth } from "@/context/authContext";
import { useChannels } from "@/context/channelsContext";

import { ChannelsEnum } from "@/utils/types/channels";
import { Campaigns, Posts } from "@/utils/types/db";
import { PostsMap } from "@/utils/types/misc";

import {
  campaignsNodeQuery,
  firebaseLogout,
  postsNodeQuery,
} from "@/utils/firebase";

export default function Page() {
  const router = useRouter();

  const { user } = useAuth();
  const { channelsState } = useChannels();

  const [campaigns, setCampaigns] = useState<Campaigns | null>(null);
  const [posts, setPosts] = useState<Posts | null>(null);

  const [selectedChannel, setSelectedChannel] =
    useState<ChannelsEnum>("facebook");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    campaigns && Object.keys(campaigns).map((id) => id)?.[0]
  );
  const [channelPostsMap, setChannelPostsMap] = useState<PostsMap>({});
  const [campaignPostsMap, setCampaignPostsMap] = useState<PostsMap>({});

  const connectedChannels: string[] = Object.keys(channelsState).filter(
    (key) => {
      const channelName = key as ChannelsEnum;
      return channelsState[channelName].token;
    }
  );

  const cards = [
    {
      title: "Created Campaigns for Marketing Already?",
      subtitle: "Lookup your Campaigns",
      hide: false,
      onClick() {
        router.push(`/dashboard/campaigns`);
      },
    },
    {
      title: "Have Posts tagged to Campaigns?",
      subtitle: "Lookup your Posts",
      hide: !connectedChannels.length,
      onClick() {
        router.push(`/dashboard/posts`);
      },
    },
    {
      title: `${
        !connectedChannels.length
          ? "Get Started with any of your Social Media Channels!"
          : "Have more Social Channels in mind?"
      }`,
      subtitle: `Connect ${
        connectedChannels.length ? "more Channels" : "a Channel"
      }`,
      hide: false,
      onClick() {
        router.push("/dashboard/channels");
      },
    },
  ];

  const handleChannelChange = (event: SelectChangeEvent<any>) => {
    setSelectedChannel(event.target.value);
  };

  const handleCampaignChange = (event: SelectChangeEvent<any>) => {
    setSelectedCampaignId(event.target.value);
  };

  useEffect(() => {
    if (posts && selectedChannel && channelsState[selectedChannel]) {
      setChannelPostsMap(() => {
        const postsMap: PostsMap = {};
        Object.entries(posts ?? {})?.forEach(([id, post]) => {
          postsMap[id] = {
            token:
              channelsState[selectedChannel].pages?.find(
                (page) => page.id === post.pageId
              )?.access_token ?? "",
            channel: selectedChannel,
          };
        });
        return postsMap;
      });
    }
  }, [selectedChannel, posts, channelsState]);

  useEffect(() => {
    if (posts && campaigns && selectedCampaignId && channelsState.facebook) {
      setCampaignPostsMap(() => {
        const { posts: _posts } = campaigns[selectedCampaignId];
        const postsMap: PostsMap = {};
        if (_posts) {
          Object.keys(_posts).forEach((_id) => {
            postsMap[_id] = {
              channel: "facebook",
              token:
                channelsState.facebook.pages?.find(
                  (page) => page.id === posts[_id]?.pageId
                )?.access_token || "",
            };
          });
        }
        return postsMap;
      });
    }
  }, [selectedCampaignId, posts, channelsState, campaigns]);

  useEffect(() => {
    dbOnValue(campaignsNodeQuery(user?.uid), (snapshot) => {
      const data = snapshot.val();
      setCampaigns(data);
      setSelectedCampaignId(Object.keys(data ?? {})?.[0]);
    });
    dbOnValue(postsNodeQuery(user?.uid), (snapshot) => {
      const data = snapshot.val();
      setPosts(data);
    });
  }, [user, channelsState]);

  return (
    <div>
      <Card className="appbar" elevation={10}>
        <Typography variant="h5">
          <b>Hello {user?.displayName}! Welcome to Social Pype!</b>
        </Typography>
        <Button startIcon={<LogoutOutlined />} onClick={firebaseLogout}>
          Logout
        </Button>
      </Card>
      <div className="dashboard-btn-cards">
        {cards.map((card) =>
          !card.hide ? (
            <DashboardButtonsCard
              key={card.title}
              title={card.title}
              subtitle={card.subtitle}
              onClick={card.onClick}
            />
          ) : (
            <></>
          )
        )}
      </div>

      <div className="all-analytics-wrapper">
        <div className="analytics-holder">
          {/* channels analytics */}
          {connectedChannels.length && posts ? (
            <Box className="analytic-container">
              <FormControl className="analytic-select" required>
                <InputLabel>Channel</InputLabel>
                <Select
                  input={<OutlinedInput label="Channel" />}
                  onChange={handleChannelChange}
                  fullWidth
                  value={selectedChannel}
                >
                  {connectedChannels?.map((channel) => (
                    <MenuItem key={channel} value={channel}>
                      {channel}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedChannel ? (
                <AnalyticsGraph postsMap={channelPostsMap} />
              ) : (
                <Typography>Please Select a valid Channel!</Typography>
              )}
            </Box>
          ) : (
            <></>
          )}

          {/* Campaigns analytics */}
          {campaigns && posts && connectedChannels?.length ? (
            <Box className="analytic-container">
              <FormControl className="analytic-select" required>
                <InputLabel>Campaign</InputLabel>
                <Select
                  input={<OutlinedInput label="Campaign" />}
                  onChange={handleCampaignChange}
                  fullWidth
                  value={selectedCampaignId}
                >
                  {Object.entries(campaigns)?.map(([campaignId, { name }]) => (
                    <MenuItem key={campaignId} value={campaignId}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedCampaignId ? (
                <AnalyticsGraph postsMap={campaignPostsMap} />
              ) : (
                <Typography>Please Select a valid Campaign!</Typography>
              )}
            </Box>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
