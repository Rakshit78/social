"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Popover,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { AvTimer, Send } from "@mui/icons-material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import moment, { Moment } from "moment";
import { useRouter } from "next/navigation";
import { onValue as dbOnValue, update } from "firebase/database";

import SocialGPT from "@/components/socialGPT";

import { useAuth } from "@/context/authContext";
import { useChannels } from "@/context/channelsContext";

import { fbPublishPost } from "@/utils/facebookSDK";
import {
  campaignsNodePostsRef,
  postsNodeRef,
  campaignsNodeQuery,
} from "@/utils/firebase";
import { ChannelsEnum } from "@/utils/types/channels";
import { Campaigns } from "@/utils/types/db";
import { channels } from "@/utils/constants";
import image from "@/assets/images";

import "./styles.scss";

export default function Page() {
  const { user } = useAuth();
  const { channelsState } = useChannels();

  const [channel, setChannel] = useState<ChannelsEnum>("facebook");

  const {
    [channel]: { pages },
  } = channelsState;

  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaigns | null>(null);
  const [campaignToTagWith, setCampaignToTagWith] = useState<null | string>();

  const [postMessage, setPostMessage] = useState<string>("");
  const [base64IMG, setBase64IMG] = useState<string>("");

  const [pagesToPost, setPagesToPost] = useState([]);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [time, setTime] = useState<Moment | null>();
  const [date, setDate] = useState<Moment | null>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.currentTarget.focus();
    setPostMessage(e.target.value);
  };

  const handleImageInput = () => {
    fileInputRef.current?.click();
  };

  const convertToBase64 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => {
        setBase64IMG(reader.result as string);
      };
    }
  };

  const handleChannelChange = (event: SelectChangeEvent<any>) => {
    const {
      target: { value },
    } = event;
    setChannel(value?.toLowerCase());
  };

  const handlePageChange = (event: SelectChangeEvent<any>) => {
    const {
      target: { value },
    } = event;
    setPagesToPost(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleCampaignChange = (event: SelectChangeEvent<any>) => {
    const {
      target: { value },
    } = event;
    setCampaignToTagWith(value);
  };

  const publishPost = () => {
    const pagesMap: Record<string, any> = {};
    pages.forEach((page) => {
      pagesMap[page.name] = page;
    });

    let scheduledTime;
    if (time && !date) {
      scheduledTime = time.toISOString();
    } else if (date && !time) {
      scheduledTime = date.toISOString();
    } else if (time && date) {
      scheduledTime = date
        .set({
          hour: time.get("hour"),
          minute: time.get("minute"),
          second: time.get("second"),
        })
        .toISOString();
    }
    const pagesData = [...pagesToPost].map((pageName) => {
      const thePage = pagesMap[pageName];
      if (thePage) {
        return {
          pageId: thePage.id,
          token: thePage.access_token,
        };
      }
    });

    fbPublishPost(pagesData, {
      postMessage,
      scheduledTime,
      photo: base64IMG,
    }).then((responseArray: Record<"id" | "pageId", string>[]) => {
      const postsObj: Record<string, any> = {};
      const campaignsNodePostsObj: Record<string, boolean> = {};
      responseArray.forEach((resp) => {
        campaignsNodePostsObj[resp.id] = true;
        postsObj[resp.id] = {
          channel: channel.toUpperCase(),
          createdBy: user?.uid || "GuestUser",
          campaignId: campaignToTagWith,
          date: moment(new Date()).toLocaleString(),
          pageId: resp.pageId,
        };
      });

      if (campaignToTagWith) {
        update(campaignsNodePostsRef(campaignToTagWith), campaignsNodePostsObj);
        update(postsNodeRef, postsObj);
        router.push(`/dashboard/posts`);
      }
    });
  };

  const actionButtons = [
    {
      key: "img_post",
      image: image.img_post,
      onClick: handleImageInput,
    },
    {
      key: "video_post",
      image: image.video_post,
      onClick: () => {},
    },
  ];

  useEffect(() => {
    dbOnValue(campaignsNodeQuery(user?.uid), (snapshot) => {
      const data = snapshot.val();
      setCampaigns(data);
    });
  }, [channel, user, channelsState]);

  return (
    <Box className="container">
      <Box className="post-container">
        {/* Post Creation */}
        <Box
          component="form"
          noValidate
          autoComplete="off"
          className="form-container"
        >
          <Box className="publish-container">
            <FormControl className="select-form" required>
              <InputLabel>Channel</InputLabel>
              <Select
                onChange={handleChannelChange}
                fullWidth
                input={<OutlinedInput label="Channel" />}
                value={channel}
                renderValue={(value) => <Chip key={value} label={value} />}
              >
                {channels?.map((_channel) => (
                  <MenuItem key={_channel} value={_channel.toLowerCase()}>
                    {_channel}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className="select-form" required>
              <InputLabel>Pages to Publish</InputLabel>
              <Select
                multiple
                onChange={handlePageChange}
                multiline
                fullWidth
                input={<OutlinedInput label="Pages to Publish" />}
                value={pagesToPost}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {pages?.map((page) => (
                  <MenuItem key={page.id} value={page.name}>
                    {page.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box className="buttons-container">
              <Button
                className="button"
                variant="outlined"
                endIcon={<AvTimer />}
                disabled={!(pagesToPost.length && postMessage.length)}
                onClick={(event) => setAnchorEl(event.currentTarget)}
              >
                Schedule
              </Button>
              <Popover
                id="timePicker"
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      mb: 2,
                    }}
                  >
                    <TimePicker
                      sx={{ mr: 2 }}
                      minTime={moment(new Date())}
                      defaultValue={moment(new Date())}
                      onChange={(value) => setTime(value)}
                    />
                    <DatePicker
                      minDate={moment(new Date())}
                      defaultValue={moment(new Date())}
                      onChange={(value) => setDate(value)}
                    />
                  </Box>
                  <Button
                    className="button"
                    variant="contained"
                    endIcon={<Send />}
                    onClick={publishPost}
                  >
                    Post at the Scheduled time
                  </Button>
                </Box>
              </Popover>
              <Button
                className="button"
                variant="contained"
                endIcon={<Send />}
                onClick={publishPost}
                disabled={!(pagesToPost.length && postMessage.length)}
              >
                Post
              </Button>
            </Box>
          </Box>
          <Divider style={{ width: "100%" }} />
          <Box className="post-inputs-container">
            <Box className="text-field-actions-holder">
              <TextField
                className="text-field"
                placeholder="Type post description here.."
                multiline
                rows={base64IMG ? 10 : 22}
                variant="standard"
                autoFocus
                value={postMessage}
                onChange={handleTextChange}
                InputProps={{
                  disableUnderline: true,
                }}
              />
              <Box className="action-buttons">
                {actionButtons.map((item) => (
                  <div
                    key={item.key}
                    className="image-holder"
                    onClick={item.onClick}
                  >
                    <Image src={item.image} alt={item.key} height={32} />
                  </div>
                ))}
                {/* Tagging to a campaign */}
                <FormControl className="campaign-select">
                  <InputLabel>Campaign to tag with</InputLabel>
                  <Select
                    onChange={handleCampaignChange}
                    label="Campaign to tag with"
                    value={campaignToTagWith}
                  >
                    {Object.entries(campaigns ?? {})?.map((entry) => {
                      const [campaignId, campaign] = entry;
                      return (
                        <MenuItem key={campaignId} value={campaignId}>
                          {campaign.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <input
              aria-label="file upload"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="file-input"
              onChange={convertToBase64}
            />
            {base64IMG && <img className="image" src={base64IMG} alt="Image" />}
          </Box>
        </Box>

        {/* AI Prompt */}
        <Box className="ai-container">
          <Typography className="title" variant="h5">
            Social GPT
          </Typography>
          <SocialGPT />
          {/* <GPTChat /> */}
        </Box>
      </Box>
    </Box>
  );
}
