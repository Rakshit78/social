"use client";
import "./globals.css";

import { ThemeProvider } from "@mui/material";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import AuthContextProvider from "@/context/authContext";
import ChannelsContextProvider from "@/context/channelsContext";

import { lightTheme } from "@/muiTheme";
import { initFacebookSdk } from "@/utils/facebookSDK";
import { isClient } from "@/utils/helpers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <title>Social Pype</title>
        <meta
          name="description"
          content="Pype through your goals with our campaign tools!"
        />
        <Script
          id="fbSDK"
          async
          defer
          src="https://connect.facebook.net/en_US/sdk.js"
        >
          {isClient && initFacebookSdk()}
        </Script>

        <link rel="icon" href="/favicon.ico" />
      </head>
      <ThemeProvider theme={lightTheme}>
        <AuthContextProvider>
          <ChannelsContextProvider>
            <body>
              {children}
              <Analytics />
              <SpeedInsights />
            </body>
          </ChannelsContextProvider>
        </AuthContextProvider>
      </ThemeProvider>
    </html>
  );
}
