import { User } from "firebase/auth";
import { ChannelsEnum, FacebookChannelType } from "./channels";

export type ChannelsState = Record<ChannelsEnum, FacebookChannelType>; // todo: add channels other than facebook

export type ChannelsContextType = {
  channelsState: ChannelsState;
  setChannelsState: Function;
};

export type AuthContextType = {
  user: User | null;
  setUser: Function;
  loadingUser: boolean;
  authError: boolean;
};
