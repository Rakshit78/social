import { Moment } from "moment";
import { ChannelsEnum } from "./channels";

export type PostsMapRecordValue = { token: string; channel: ChannelsEnum };
export type PostId = string;
export type PostsMap = Record<PostId, PostsMapRecordValue>;

export type ChannelsPageIdTokenMap = {
  pageId: string;
  token: string;
};

export type ChannelsPageIdTokenMapWithRange = {
  pageId: string;
  token: string;
  range?: ViewRange;
};

export type ChannelPostItem = {
  created_time: string;
  id: string;
  message: string;
};

export type CampaignFormData = {
  name: string;
  description: string;
  startDate: null | Moment | string;
  channels: string[];
};

export type AnalyticsDataItem = {
  key: string;
  time: string;
  positives: number;
  negatives: number;
  total: number;
  name: string;
};

export type AnalyticsData = AnalyticsDataItem[];

export type ViewRange = {
  start: Date | string;
  end: Date | string;
};
