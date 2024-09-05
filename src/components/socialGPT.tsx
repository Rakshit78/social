import {
  Message,
  MessageList,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { useChat } from "ai/react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { Send } from "@mui/icons-material";

import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./styles.scss";

export default function SocialGPT() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/socialgpt",
    });

  return (
    <Box className="social-gpt">
      {
        <Box
          className={messages?.length ? "messages-wrapper" : "empty-wrapper"}
        >
          {messages?.length ? (
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                isLoading ? <TypingIndicator className="typing" /> : null
              }
              className="messages"
            >
              {messages.map((message, i) => {
                return (
                  <Message
                    key={i}
                    model={{
                      message: message.content,
                      sender: message.role,
                      direction:
                        message.role === "user" ? "outgoing" : "incoming",
                      sentTime: message.createdAt?.toUTCString(),
                      position: "last",
                    }}
                  />
                );
              })}
            </MessageList>
          ) : (
            <Typography variant="caption">Wow! So empty here!</Typography>
          )}
        </Box>
      }
      <form onSubmit={handleSubmit} className="input-wrapper">
        <TextField
          className="input"
          value={input}
          contentEditable
          onChange={handleInputChange}
          fullWidth
        />
        <Button
          endIcon={<Send />}
          type="submit"
          variant="contained"
          className="btn"
        >
          Send
        </Button>
      </form>
    </Box>
  );
}
