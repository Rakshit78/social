import { ChannelsEnum } from "./channels";

export type Campaign = {
  name: string;
  description: string;
  startDate: string;
  status: string;
  posts: Record<string, boolean>;
};

export type Post = {
  campaignId: string;
  channel: ChannelsEnum;
  createdBy: string;
  date: string;
  pageId: string;
};

export type Campaigns = Record<string, Campaign>;

export type Posts = Record<string, Post>;
