"use client";

import React, { useEffect, useState } from "react";
import { Box, Modal } from "@mui/material";
import Calender from "react-calendar";
import "react-calendar/dist/Calendar.css";

import CalendarContentItem from "./calendarContentItem";
import CalendarModalContent from "./calendarModalContent";

import "./styles.scss";

type Props = {
  calenderData: any;
  setActiveViewRange: Function;
  contentKey: string;
  timeKey: string;
};

const CalendarView = ({
  calenderData,
  setActiveViewRange = () => {},
  contentKey,
  timeKey,
}: Props) => {
  const [contentObject, setContentObject] = useState<Record<
    string,
    any[]
  > | null>();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<any>();

  function getCurrentViewRange() {
    const date = new Date();
    return {
      start: new Date(date.getFullYear(), date.getMonth(), 1),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
    };
  }

  useEffect(() => {
    setContentObject(calenderData);
  }, [calenderData]);

  useEffect(() => {
    setActiveViewRange(getCurrentViewRange());
  }, []);

  return (
    <>
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        className="modal"
      >
        <Box>
          <CalendarModalContent
            items={modalContent}
            closeModal={() => setShowModal(false)}
          />
        </Box>
      </Modal>
      <Box className="calender-view">
        <Calender
          onClickDay={(date) => {
            const day = String(date.getDate());
            const itemsList = contentObject?.[day];
            if (itemsList?.length) {
              setModalContent(
                itemsList?.map((content) => ({
                  text: content?.[contentKey],
                  date: content?.[timeKey],
                }))
              );
              setShowModal(true);
            } else {
              alert("No Data Found!");
            }
          }}
          onActiveStartDateChange={({ activeStartDate }) => {
            setContentObject(null);
            if (activeStartDate) {
              const end = new Date(
                activeStartDate.getFullYear(),
                activeStartDate.getMonth() + 1,
                0
              );
              setActiveViewRange({
                start: activeStartDate,
                end,
              });
            }
          }}
          tileClassName="calendar-tile"
          tileContent={({ date, view }) => {
            if (view === "month") {
              const day = String(date.getDate());
              return (
                <Box>
                  {contentObject?.[day]?.map((content) => (
                    <CalendarContentItem
                      key={content?.id}
                      text={content?.[contentKey]}
                    />
                  ))}
                </Box>
              );
            }
            return null;
          }}
        />
      </Box>
    </>
  );
};

export default CalendarView;
