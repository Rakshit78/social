import { timeLines } from "./constants";
import { FacebookPageType } from "./types/channels";
import { ChannelsPageIdTokenMapWithRange, ViewRange } from "./types/misc";

export function base64ToBlob(base64: string) {
  let byteCharacters = atob(base64.split(",")[1]);
  let byteNumbers = [];
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  let byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: "image/png" });
}

// works for fb now
export function pageItemData(
  page: FacebookPageType,
  range?: ViewRange
): ChannelsPageIdTokenMapWithRange {
  return {
    pageId: page.id,
    token: page.access_token,
    range,
  };
}

export function timesArray({ period, count } = timeLines.daily) {
  const times = [];
  let currDate = new Date();
  for (let i = 1; i <= count; i++) {
    const timeObj = {
      until: currDate.toISOString(),
      since: "0",
    };
    currDate.setDate(currDate.getDate() - period);
    timeObj.since = currDate.toISOString();
    times.unshift(timeObj);
  }

  return times;
}

export function parseJwt(token: string) {
  var base64Url = token.split(".")[1];
  console.log({ token, base64Url });
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

export function hasJWTExpired(token: string) {
  const decodedToken = parseJwt(token);
  const currentTime = Date.now() / 1000;
  const expiry = decodedToken?.exp;
  return Math.floor(currentTime) >= expiry;
}

export function timeToExpireJWT(token: string) {
  const decodedToken = parseJwt(token);
  const currentTime = Date.now() / 1000;
  var timeLeft = decodedToken?.exp - currentTime;
  return timeLeft;
}

export function runBeforeJWTexpiry({
  token,
  callback,
  time = 10,
}: {
  token: string;
  callback: Function;
  time: number;
}) {
  const timeLeft = timeToExpireJWT(token);

  setTimeout(callback, (timeLeft - time) * 1000);
}

export const isClient = typeof window !== "undefined";

export function getWindowDimensions() {
  if (isClient) {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      windowWidth: width,
      windowHeight: height,
    };
  } else {
    return {
      windowWidth: 0,
      windowHeight: 0,
    };
  }
}

export function addAlpha(color: string, opacity: number) {
  // coerce values so it is between 0 and 1.
  const _opacity = Math.round(Math.min(Math.max(opacity ?? 1, 0), 1) * 255);
  return color + _opacity.toString(16).toUpperCase();
}
