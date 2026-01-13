"use client";

import TopBar from "./TopBar";

export default function TopBarWrapper() {
  // TopBar is always rendered; Landing screen will overlay it with z-index
  return (
    <>
      <TopBar />
      <div style={{ paddingTop: "60px" }} />
    </>
  );
}

