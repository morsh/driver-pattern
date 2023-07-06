import React from "react";
import { Store } from "@reduxjs/toolkit";

// Helper type to define functions that can be called with any number of arguments
type Fn = (...args: any) => any;

// Getters can define a string as a testid or a general function
export type IGetters = Record<string, string | Fn>;

// Actions are functions that can be called with any number of arguments
export type IActions = Record<string, Fn>;

// ICreateStore is a method that receivs an object that can receive a preloadedState parameter
// and returns a redux Store
export type ICreateStore = <T extends { preloadedState: any }>(arg0: T, ...args: any[]) => Store;

interface IBaseDriver<
  Props extends object,
  Getters extends object,
  Actions extends IActions,
> {
  initialize: () => this;
  given: {
    [prop in keyof Props]-?: (
      arg: Props[prop]
    ) => this;
  };
  when: {
    [key in keyof Actions | "render"]: key extends "render" ? (() => this) : ((...args: Parameters<Actions[key]>) => this);
  };
  get: {
    [getKey in keyof Getters]-?: Getters[getKey] extends Fn ? Getters[getKey] : () => HTMLElement | null;
  };
}

interface IDriverWithCreateStore<
  Props extends object,
  Getters extends object,
  Actions extends IActions,
  CreateStore extends ICreateStore,
> extends IBaseDriver<Props, Getters, Actions> {
  givenState: {
    [stateProp in keyof ReturnType<ReturnType<CreateStore>["getState"]>]: (
      stateValue: ReturnType<ReturnType<CreateStore>["getState"]>[stateProp]
    ) => this;
  };
}

export type IDriver<
  Props extends object,
  Getters extends object,
  Actions extends IActions,
  CreateStore extends ICreateStore | undefined,
> = CreateStore extends ICreateStore ?
  IDriverWithCreateStore<Props, Getters, Actions, CreateStore> :
  IBaseDriver<Props, Getters, Actions>;