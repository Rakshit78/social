"use client";

import React from "react";
import { Tab, Tabs } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

import "./styles.scss";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const pathname = usePathname();

  const tabsList = [
    {
      title: "Create Post",
      link: "/dashboard/posts/publish",
    },
    {
      title: "Feed Content",
      link: "/dashboard/posts/feed",
    },
  ];

  const dashboardPathnameRoot = pathname?.split("/").slice(0, 4).join("/");

  return (
    <div className="channels-tab-container">
      <div className="tabs-btn-container">
        <Tabs
          value={dashboardPathnameRoot}
          variant="scrollable"
          defaultValue="/dashboard/posts/publish"
          className="channels-tab"
        >
          {tabsList.map((content) => (
            <Tab
              key={content.link}
              value={content.link}
              onClick={() => router.push(content.link)}
              className="tab"
              label={content.title}
            />
          ))}
        </Tabs>
      </div>

      <main className="content" key={pathname}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
