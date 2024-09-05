"use client";

import React, { useEffect } from "react";
import { Button, Box, Typography } from "@mui/material";
import { Google } from "@mui/icons-material";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/authContext";

import { googleSignin } from "@/utils/firebase";

import "./style.scss";

const Auth = () => {
  const route = useRouter();

  const { user } = useAuth();

  const version = "v0.1.2024.01.30";

  const moveToDashboard = () => route.replace("/dashboard");

  useEffect(() => {
    console.log({ version });
    if (user?.uid) {
      moveToDashboard();
    }
  }, [user?.uid]);

  return (
    <Box className="auth">
      <Button
        startIcon={<Google />}
        onClick={() => googleSignin(moveToDashboard)}
        variant="contained"
      >
        Sign in
      </Button>
      <Typography variant="caption">{version}</Typography>
    </Box>
  );
};

export default Auth;
