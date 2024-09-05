"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from "@mui/material";

import CalendarView from "@/components/calendarView";

import { useAuth } from "@/context/authContext";
import { useChannels } from "@/context/channelsContext";

import { fbGetPosts } from "@/utils/facebookSDK";
import { pageItemData } from "@/utils/helpers";
import { channels } from "@/utils/constants";

import { ChannelsEnum } from "@/utils/types/channels";
import {
  ChannelPostItem,
  ChannelsPageIdTokenMapWithRange,
  ViewRange,
} from "@/utils/types/misc";

import "./styles.scss";

export default function ChannelsPostsListPage() {
  const { user } = useAuth();
  const { channelsState } = useChannels();

  const [channel, setChannel] = useState<ChannelsEnum>("facebook");

  const pages = channelsState?.[channel]?.pages;

  // for calendar view
  const [activeViewRange, setActiveViewRange] = useState<ViewRange>();
  const [calendarData, setCalendarData] = useState();

  const [selectedPage, setSelectedPage] = useState<
    ChannelsPageIdTokenMapWithRange | undefined
  >(pages?.length ? pageItemData(pages?.[0], activeViewRange) : undefined);
  const [posts, setPosts] = useState<ChannelPostItem[]>([]);

  const getThePage = (id: string) =>
    pages.find((page) => String(page.id) === id);

  function getPostsInRange() {
    // todo: use posts posts from firebase and pagination
    fbGetPosts({ ...selectedPage, range: activeViewRange } as any).then(
      (response) => setPosts(response.data)
    );
  }

  const onChannelChange = (event: SelectChangeEvent<any>) => {
    const {
      target: { value },
    } = event;
    setChannel(value?.toLowerCase());
  };

  const onPageChange = (event: SelectChangeEvent) => {
    const thePage = getThePage(String(event.target.value));
    if (thePage) {
      setSelectedPage(pageItemData(thePage, activeViewRange));
    }
  };

  useEffect(() => {
    const postsMap: any = {};
    Object.entries(posts ?? {})?.forEach(([_, value]) => {
      const createdDayOfTheMonth = new Date(value?.created_time)
        .getDate()
        ?.toString();
      if (postsMap[createdDayOfTheMonth]) {
        postsMap[createdDayOfTheMonth]?.push(value);
      } else {
        postsMap[createdDayOfTheMonth] = [value];
      }
    });
    setCalendarData(postsMap);
  }, [posts]);

  useEffect(() => {
    if (selectedPage && activeViewRange) {
      getPostsInRange();
    }
  }, [selectedPage?.pageId, activeViewRange]);

  useEffect(() => {
    const firstPage = pages?.[0];
    setSelectedPage(firstPage && pageItemData(firstPage, activeViewRange));
  }, [pages, user]);

  if (selectedPage) {
    return (
      <div className="container">
        <div className="channel-page-selector-container">
          <FormControl className="select-form" required>
            <InputLabel>Channel</InputLabel>
            <Select
              className="select"
              onChange={onChannelChange}
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
            <InputLabel>Page</InputLabel>
            <Select
              className="select"
              onChange={onPageChange}
              multiline
              fullWidth
              input={<OutlinedInput label="Page" />}
              value={selectedPage?.pageId}
              displayEmpty
            >
              {pages?.map((page) => (
                <MenuItem key={page.id} value={page.id}>
                  {page.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <Box className="page-posts-analytics-container">
          <Box className="posts-container">
            <CalendarView
              calenderData={calendarData}
              setActiveViewRange={setActiveViewRange}
              contentKey="message"
              timeKey="created_time"
            />
          </Box>
        </Box>
      </div>
    );
  }
}
