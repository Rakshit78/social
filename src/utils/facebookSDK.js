import { timeLines } from "./constants";
import { base64ToBlob, timesArray } from "./helpers";

export const initFacebookSdk = () => {
  return new Promise((resolve, reject) => {
    // Load the Facebook SDK asynchronously
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: "277077205257151",
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
      // Resolve the promise when the SDK is loaded
      resolve(true);
    };
  });
};

export const getFacebookLoginStatus = ({ getPages = true }) => {
  return new Promise((resolve, reject) => {
    window.FB.getLoginStatus((response) => {
      if (getPages) {
        fbGetPagesList(response?.authResponse?.userID).then((pages) =>
          resolve({ ...response, pages, createdAt: new Date() })
        );
      } else {
        resolve(response);
      }
    });
  });
};

export const fbLogin = () => {
  return new Promise((resolve, reject) => {
    window.FB.login(
      (response) => {
        fbGetPagesList(response?.authResponse?.userID).then((pages) => {
          return resolve({ ...response, pages, createdAt: new Date() });
        });
      },
      {
        scope:
          "pages_show_list, read_insights, pages_read_engagement, pages_manage_posts",
      }
    );
  });
};

export const fbLogout = () => {
  return new Promise((resolve, reject) => {
    window.FB.logout((response) => {
      resolve(response);
    });
  });
};

export const fbGetPagesList = (userId) => {
  return new Promise((resolve, reject) => {
    window.FB.api(`/${userId}/accounts`, function (response) {
      if (response && !response.error) {
        resolve(response);
      }
    });
  });
};

// upload
export const fbPublishPost = (pagesList, postData) => {
  const { postMessage, scheduledTime, photo } = postData;

  const thePostMessage = {
    message: postMessage,
    published: !Boolean(scheduledTime), // if scheduled time is available publish should be false
    scheduled_publish_time: scheduledTime,
  };

  const publishAPost = ({ pageId, token }) =>
    new Promise((resolve) => {
      window.FB.api(
        `/${pageId}/feed`,
        "POST",
        { access_token: token, ...thePostMessage },
        function (response) {
          if (response && !response.error) {
            resolve({ ...response, pageId });
          }
        }
      );
    });

  if (photo) {
    const blob = base64ToBlob(photo);
    const formData = new FormData();
    formData.append("source", blob);

    const theImagePost = {
      published: !postMessage, // if there's no message publish at once
      scheduled_publish_time: scheduledTime,
      source: photo,
    };

    // WIP
    return new Promise((resolve, reject) => {
      pagesList.forEach(({ pageId, token }) =>
        window.FB.api(
          `/${pageId}/photos`,
          "POST",
          { access_token: token, ...theImagePost },
          function (response) {
            console.log({ response });
            // not required to be posted if post message is not available
            if (postMessage) {
              if (response && !response.error) {
                window.FB.api(
                  `/${pageId}/feed`,
                  "POST",
                  {
                    access_token: token,
                    ...thePostMessage,
                    attached_media: [{ media_fbid: response.id }],
                  },
                  function (response) {
                    if (response && !response.error) {
                      resolve(response);
                    }
                  }
                );
              }
            }
          }
        )
      );
    });
  }

  return Promise.all(
    pagesList.map(({ pageId, token }) => publishAPost({ pageId, token }))
  );
};

// pagesList : []{pageId,token}
export const fbGetPosts = ({ pageId, token, range = null }) => {
  return new Promise((resolve, reject) => {
    const params = { access_token: token };
    if (range) {
      params.since =
        typeof range?.start === "string"
          ? range?.start
          : range?.start?.toUTCString();
      params.until =
        typeof range?.end === "string" ? range?.end : range?.end?.toUTCString();
    }
    window.FB.api(`/${pageId}/feed`, "GET", params, function (response) {
      if (response && !response.error) {
        resolve(response);
      }
    });
  });
};

export const fbGetPostInsights = (
  postId,
  token,
  timeLine = timeLines.daily
) => {
  const times = timesArray(timeLine);

  const reactions = ["LIKE", "LOVE", "CARE", "HAHA", "WOW", "SAD", "ANGRY"];

  const getIndividualAnalytics = ({ since, until }) => {
    const params = {
      access_token: token,
      fields: reactions
        .map(
          (rctn) =>
            `reactions.type(${rctn}).since(${since}).until(${until}).summary(total_count).as(${rctn})`
        )
        .join(","),
    };
    return new Promise((resolve, reject) => {
      window.FB.api(`/${postId}`, "GET", params, function (response) {
        if (response && !response.error) {
          const { LIKE, LOVE, CARE, HAHA, WOW, SAD, ANGRY } = response;

          const getValuesUntil = (obj) =>
            obj?.paging ? obj.summary.total_count : 0;

          const positives =
            getValuesUntil(LIKE) +
            getValuesUntil(LOVE) +
            getValuesUntil(CARE) +
            getValuesUntil(HAHA) +
            getValuesUntil(WOW);

          const negatives = getValuesUntil(SAD) + getValuesUntil(ANGRY);

          resolve({
            name: "Responses",
            positives,
            negatives,
            time: until,
            key: until,
          });
        }
      });
    });
  };

  return Promise.all(
    times.map(({ until, since }) => {
      return getIndividualAnalytics({ until, since });
    })
  );
};

export const fbGetPageInsights = ({
  pageId,
  token,
  isForGraph = false,
  isForPosts = false,
  postIds = [],
  timeLine = timeLines.daily,
}) => {
  const times = timeLine;

  const getIndividualAnalytics = ({ until, since }) => {
    return new Promise((resolve, reject) => {
      window.FB.api(
        `/${pageId}/insights`,
        "GET",
        {
          access_token: token,
          since,
          until,
          metric: ["page_impressions"],
        },
        function (response) {
          if (response && !response.error) {
            resolve({
              name: "Impressions",
              time: until,
              total: response?.data[0]?.values?.[0]?.value,
              key: until,
            });
          }
        }
      );
    });
  };

  if (isForPosts) {
    return Promise.all(
      postIds?.map((id) => fbGetPostInsights(id, token, timeLine))
    );
  } else {
    if (isForGraph) {
      return Promise.all(
        times.map(({ until, since }) => {
          return getIndividualAnalytics({ until, since });
        })
      );
    }

    return new Promise((resolve, reject) => {
      window.FB.api(
        `/${pageId}/insights`,
        "GET",
        {
          access_token: token,
          metric: ["page_impressions", "page_fans"],
        },
        function (response) {
          if (response && !response.error) {
            resolve(response);
          }
        }
      );
    });
  }
};
