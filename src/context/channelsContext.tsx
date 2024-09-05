"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "./authContext";

import { ChannelsContextType } from "@/utils/types/context";

export const initialChannelsState = {
  facebook: {
    token: null,
    pages: [],
    createdAt: null,
  },
  linkedin: {
    token: null,
    pages: [],
    createdAt: null,
  },
};

export const ChannelsContext = createContext<ChannelsContextType>({
  channelsState: initialChannelsState,
  setChannelsState: () => {},
});

export default function ChannelsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const [channelsState, setChannelsState] = useState(initialChannelsState);

  const isAnyChannelConnected = Object.values(channelsState).some(
    (channel) => channel?.token
  );

  useEffect(() => {
    if (channelsState && user && isAnyChannelConnected) {
      window.sessionStorage.setItem(user.uid, JSON.stringify(channelsState));
    }
  }, [channelsState]);

  return (
    <ChannelsContext.Provider value={{ channelsState, setChannelsState }}>
      {children}
    </ChannelsContext.Provider>
  );
}

export const useChannels = () => useContext(ChannelsContext);
