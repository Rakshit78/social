"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const PostsPage = () => {
  const route = useRouter();

  useEffect(() => {
    route.push("/dashboard/posts/publish");
  }, []);
  return <></>;
};

export default PostsPage;
