"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { hydrateUser } from "./features/users/currentUserSlice";

function HydrateCurrentUser({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(hydrateUser());
  }, []);

  return <>{children}</>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <HydrateCurrentUser>{children}</HydrateCurrentUser>
    </Provider>
  );
}
