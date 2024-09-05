export type ChannelsEnum =
  | "facebook"
  | "linkedin"
  | "instagram"
  | "x"
  | "quora"
  | "youtube";

export type FacebookPageType = {
  token: string;
  id: string;
  name: string;
  access_token: string;
  category: string;
  category_list: any[];
  tasks: any;
};

export type FacebookChannelType = {
  pages: FacebookPageType[] | [];
  token: string | null;
  createdAt: Date | null;
};

export type ChannelsDataEnum = FacebookChannelType;
