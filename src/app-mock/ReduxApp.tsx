import React from 'react';
import { Provider, useSelector } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";

export const titleSlice = createSlice({
  name: "title",
  initialState: "Some title",
  reducers: {
    set: (_, { payload }: { type: string; payload: any }) => payload,
    update: (state, action: { type: string; payload: any }) => ({
      state,
      ...action.payload,
    }),
  },
});

export const reducer = {
  title: titleSlice.reducer,
};

export const createStore = ({
  preloadedState,
}: { preloadedState?: any } = {}) =>
  configureStore({ reducer, preloadedState });

export const ReduxComponent = () => {
  const title = useSelector((state: any) => state.title);

  return (
    <span>
      Title:&nbsp;
      <span data-testid="test-redux-title">{title}</span>
    </span>
  );
};

export const ReduxApp = () => {
  const store = createStore();

  return (
    <Provider store={store}>
      <ReduxComponent />
    </Provider>
  );
};
