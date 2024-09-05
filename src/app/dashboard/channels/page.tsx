"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { StaticImageData } from "next/image";

import ChannelCard from "@/components/channelBox";

import { fbLogin, fbLogout, getFacebookLoginStatus } from "@/utils/facebookSDK";
import { useChannels } from "@/context/channelsContext";

import { ChannelsEnum } from "@/utils/types/channels";

import images from "@/assets/images";

import "./styles.scss";

export default function Page() {
  const { channelsState, setChannelsState } = useChannels();

  const pathname = usePathname();

  const router = useRouter();

  type channelItemType = {
    title: string;
    key: ChannelsEnum;
    icon: string | StaticImageData;
    login: Function;
    logout: Function;
  };

  const channels: channelItemType[] = [
    {
      title: "Facebook",
      key: "facebook",
      icon: images.facebook,
      login: () =>
        fbLogin().then((response) => {
          if (response.status === "connected") {
            setChannelsState({
              facebook: {
                token: response.authResponse.accessToken,
                pages: response.pages.data,
                createdAt: response.createdAt || new Date(),
              },
            });
          } else {
            console.log("Not Logged in");
          }
        }),
      logout: () => {
        setChannelsState({ ...channelsState, facebook: null });
        fbLogout().then(() => {
          getFBStatus({ getPages: false });
        });
      },
    },
    {
      title: "Linkedin",
      key: "linkedin",
      icon: images.linkedin,
      login: () => {},
      logout: () => {},
    },
    {
      title: "Instagram",
      key: "instagram",
      icon: images.instagram,
      login: () => {},
      logout: () => {},
    },
    {
      title: "X",
      key: "x",
      icon: images.x,
      login: () => {},
      logout: () => {},
    },
    {
      title: "Youtube",
      key: "youtube",
      icon: images.youtube,
      login: () => {},
      logout: () => {},
    },
    {
      title: "Quora",
      key: "quora",
      icon: images.quora,
      login: () => {},
      logout: () => {},
    },
  ];

  const getFBStatus = ({ getPages = true }) => {
    getFacebookLoginStatus({ getPages }).then((response) => {
      if (response == null) {
        console.log("Not Logged in");
      } else {
        setChannelsState({
          facebook: {
            token: response?.authResponse?.accessToken,
            pages: response?.pages?.data,
            createdAt: response?.createdAt ?? new Date(),
          },
        });
      }
    });
  };

  useEffect(() => {
    if (!channelsState.facebook?.token) {
      getFBStatus({ getPages: true });
    }
  }, [pathname, channelsState]);

  return (
    <div className="channels-list">
      {/* channels list */}
      {channels.map((channel) => (
        <ChannelCard
          key={channel.key}
          onClick={() =>
            Boolean(channelsState[channel.key]?.token) && // move to channel details only if logged in
            router.push(`channels/${channel.key}`)
          }
          title={channel.title}
          icon={channel.icon}
          isOnline={Boolean(channelsState[channel.key]?.token)}
          pages={channelsState[channel.key]?.pages}
          login={channel.login}
          logout={channel.logout}
        />
      ))}
    </div>
  );
}
