"use client";

import { createContext, useContext, type ReactNode } from "react";

const ShowContext = createContext<string>("");

export function ShowProvider({
  showId,
  children,
}: {
  showId: string;
  children: ReactNode;
}) {
  return <ShowContext.Provider value={showId}>{children}</ShowContext.Provider>;
}

export function useShowId() {
  return useContext(ShowContext);
}
