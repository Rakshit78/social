import React, { ChangeEvent, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { update } from "firebase/database";

import { useAuth } from "@/context/authContext";

import { campaignsNodeRef } from "@/utils/firebase";
import { CampaignFormData } from "@/utils/types/misc";
import { channels } from "@/utils/constants";

import "./styles.scss";

const CreateCampaign = (props: {
  showModal: boolean;
  setShowModal: Function;
}) => {
  const { user } = useAuth();

  const { showModal, setShowModal } = props;

  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    startDate: null,
    channels: [],
  });

  const onChange = (
    event: ChangeEvent<HTMLInputElement>,
    key: "name" | "description" | "startDate"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  const createCampaign = () => {
    const campaignId = "campaign" + crypto.randomUUID();
    const channelsNodeObj: Record<string, boolean> = {};
    formData.channels.map((channel) => (channelsNodeObj[channel] = true));
    update(campaignsNodeRef, {
      [campaignId]: {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate?.toString(),
        channels: channelsNodeObj,
        status: "CREATED",
        createdBy: user?.uid ?? "GuestUser",
      },
    }).then(() => {
      setShowModal(false);
    });
  };

  return (
    <Modal
      open={showModal}
      onClose={() => setShowModal(false)}
      className="create-campaign"
    >
      <div className="container">
        <Typography className="title" variant="h6">
          Create a Campaign
        </Typography>
        <TextField
          className="text-field"
          label="Campaign Name"
          variant="outlined"
          autoFocus
          value={formData.name}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(event, "name")
          }
        />
        <TextField
          className="text-field"
          label="Campaign Description"
          multiline
          rows={4}
          variant="outlined"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(event, "description")
          }
          value={formData.description}
        />
        <DatePicker
          label="Start Date"
          minDate={moment(new Date())}
          defaultValue={moment(new Date())}
          value={formData.startDate}
          onChange={(value) =>
            setFormData({ ...formData, startDate: value ?? null })
          }
          className="date-picker"
          format="DD-MM-YYYY"
        />
        <FormControl>
          <InputLabel>Channels</InputLabel>
          <Select
            className="channels-picker"
            onChange={(event: SelectChangeEvent<any>) => {
              const {
                target: { value },
              } = event;
              setFormData({
                ...formData,
                channels: typeof value === "string" ? value.split(",") : value,
              });
            }}
            multiline
            multiple
            input={<OutlinedInput label="Channels" />}
            value={formData.channels}
            renderValue={() => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {formData.channels.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {channels?.map((channel) => (
              <MenuItem key={channel} value={channel}>
                {channel}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="btns-container">
          <Button
            variant="contained"
            className="cancel-btn"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            className="create-btn"
            onClick={createCampaign}
          >
            Create Campaign
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateCampaign;
