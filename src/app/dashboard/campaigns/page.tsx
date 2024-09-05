"use client";

import { useEffect, useState } from "react";
import { Button, Card, Typography } from "@mui/material";
import { Add, ThumbDown, ThumbUp } from "@mui/icons-material";
import { onValue as dbOnValue } from "firebase/database";

import CreateCampaign from "@/components/createCampaign";

import { useAuth } from "@/context/authContext";
import { useChannels } from "@/context/channelsContext";

import { campaignsNodeQuery, postsNodeQuery } from "@/utils/firebase";
import { aggregatedPostsAnalytics } from "@/utils/analytics";

import { Campaigns, Posts } from "@/utils/types/db";
import { ChannelsEnum } from "@/utils/types/channels";

import "./styles.scss";

export default function Page() {
  const { user } = useAuth();
  const { channelsState } = useChannels();

  const [campaigns, setCampaigns] = useState<Campaigns | null>(null);
  const [posts, setPosts] = useState<Posts | null>(null);

  const [showCreateCampaignDialog, setShowCreateCampaignDialog] =
    useState(false);

  useEffect(() => {
    dbOnValue(campaignsNodeQuery(user?.uid), (snapshot) => {
      const data = snapshot.val();
      setCampaigns(data);
    });
    dbOnValue(postsNodeQuery(user?.uid), (snapshot) => {
      const data = snapshot.val();
      setPosts(data);
    });
  }, [channelsState, user]);

  return (
    <div className="container">
      <CreateCampaign
        showModal={showCreateCampaignDialog}
        setShowModal={setShowCreateCampaignDialog}
      />
      <div className="header">
        <Typography variant="h5">Campaign</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowCreateCampaignDialog(true)}
        >
          Create New Campaign
        </Button>
      </div>
      <div className="campaigns-container">
        {Object.entries(campaigns ?? {})?.length ? (
          Object.entries(campaigns ?? {})?.map((entry) => {
            const [campaignId, campaignData] = entry;
            const {
              name,
              description,
              startDate,
              status,
              posts: _posts,
            } = campaignData;

            const postsMap: Record<
              string,
              { channel: ChannelsEnum; token: string }
            > = {};
            if (_posts && posts) {
              Object.keys(_posts).forEach((_id) => {
                postsMap[_id] = {
                  channel: "facebook",
                  token:
                    channelsState.facebook?.pages?.find(
                      (page) => page.id === posts[_id]?.pageId
                    )?.access_token || "",
                };
              });
            }

            let positives = 0;
            let negatives = 0;
            aggregatedPostsAnalytics(postsMap).then((res) => {
              res.flat().forEach((obj) => {
                positives += obj?.positives ?? 0;
                negatives += obj?.negatives ?? 0;
              });
            });

            return (
              <Card key={campaignId} className="campaign-card">
                <div className="card-header">
                  <Typography className="name">{name}</Typography>{" "}
                  <Typography className="status">{status}</Typography>
                </div>
                <Typography className="description">{description}</Typography>
                <div className="footer">
                  <div className="reactions">
                    <div className="reaction">
                      <ThumbUp className="reaction-icon" />
                      <Typography className="reaction-txt">
                        {positives}
                      </Typography>
                    </div>
                    <div className="reaction">
                      <ThumbDown className="reaction-icon" />
                      <Typography className="reaction-txt">
                        {negatives}
                      </Typography>
                    </div>
                  </div>
                  <Typography className="date">{startDate}</Typography>
                </div>
              </Card>
            );
          })
        ) : (
          <Typography variant="caption" color="InfoText">
            No Campaigns found! Please Create One!!
          </Typography>
        )}
      </div>
    </div>
  );
}
