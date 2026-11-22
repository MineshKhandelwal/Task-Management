import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor?: string;
}

interface CurrentUserState {
  user: CurrentUser | null;
  isHydrated: boolean;
}

const STORAGE_KEY = "taskflow_current_user";

const initialState: CurrentUserState = {
  user: null,
  isHydrated: false,
};

export const currentUserSlice = createSlice({
  name: "currentUser",
  initialState,
  reducers: {
    hydrateUser: (state) => {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            state.user = JSON.parse(stored);
          }
        } catch (e) {
          console.error("Failed to load user from localStorage", e);
        }
      }
      state.isHydrated = true;
    },
    setCurrentUser: (state, action: PayloadAction<CurrentUser>) => {
      state.user = action.payload;
      state.isHydrated = true;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
        } catch (e) {
          console.error("Failed to save user to localStorage", e);
        }
      }
    },
    clearCurrentUser: (state) => {
      state.user = null;
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          console.error("Failed to remove user from localStorage", e);
        }
      }
    },
  },
});

export const { hydrateUser, setCurrentUser, clearCurrentUser } =
  currentUserSlice.actions;

export default currentUserSlice.reducer;
