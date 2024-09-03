"use client";

import { createSlice } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector } from "react-redux";

interface TeamState {
    users: Array<UserType>;
}

const initialTeamState: TeamState = {
    users: []
};

export const teamSlice = createSlice({
    name: 'teamSlice',
    initialState: initialTeamState,
    reducers: {
        getAllUsers(state,action) {
            state.users = action.payload;
        },
        addUser(state,action) {
            state.users = [...state.users, action.payload];
        },
        deleteUser(state,action) {
            state.users = state.users.filter((user) => user._id !== action.payload);
        },
        editUser(state,action) {
            const index = state.users.findIndex((user) => user._id === action.payload._id);

            state.users[index] = {
                ...state.users[index],
                ...action.payload 
            }
        }
    }
});

export const teamSliceAction = teamSlice.actions;

export const useTypedSelector: TypedUseSelectorHook<{ teamReducer: TeamState }> = useSelector;