"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setCurrentUser as setReduxCurrentUser,
  CurrentUser,
} from "@/store/features/users/currentUserSlice";
import { useGetUsersQuery } from "@/store/services/usersApi";
import { getInitials } from "@/components/ui/Avatar";

export function useCurrentUser() {
  const dispatch = useAppDispatch();
  const { user: currentUser, isHydrated } = useAppSelector(
    (state) => state.currentUser
  );

  const { data: users, isLoading } = useGetUsersQuery({ isActive: "all" });

  // Map users to UserSummary / CurrentUser format
  const allUsers: CurrentUser[] = (users || []).map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    initials: getInitials(u.name),
    avatarColor: u.avatarColor,
  }));

  // Auto-select first active user if no user is selected yet once loaded
  useEffect(() => {
    if (isHydrated && !currentUser && users && users.length > 0) {
      const firstActive = users.find((u) => u.isActive) || users[0];
      dispatch(
        setReduxCurrentUser({
          id: firstActive._id,
          name: firstActive.name,
          email: firstActive.email,
          initials: getInitials(firstActive.name),
          avatarColor: firstActive.avatarColor,
        })
      );
    }
  }, [isHydrated, currentUser, users, dispatch]);

  const changeCurrentUser = (user: CurrentUser) => {
    dispatch(setReduxCurrentUser(user));
  };

  return {
    currentUser,
    allUsers,
    setCurrentUser: changeCurrentUser,
    isLoading,
  };
}
