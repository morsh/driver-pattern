import React from "react";
import { Store } from "@reduxjs/toolkit";
declare type Fn = (...args: any) => any;
export declare type IGetters = Record<string, string | Fn>;
export declare type IActions = Record<string, Fn>;
export declare type IStore = (args: any) => Store;
export declare type IDriver<Comp extends React.FC<Props>, Props extends object, Getter extends object, Actions extends IActions, Str extends (IStore | undefined)> = {
    initialize: () => IDriver<Comp, Props, Getter, Actions, Str>;
    given: {
        [k in keyof Props]-?: (arg: Props[k]) => IDriver<Comp, Props, Getter, Actions, Str>;
    };
    when: {
        [key in keyof Actions | "render"]: key extends "render" ? () => IDriver<Comp, Props, Getter, Actions, Str> : (...args: Parameters<Actions[key]>) => IDriver<Comp, Props, Getter, Actions, Str>;
    };
    get: {
        [key in keyof Getter]-?: Getter[key] extends Fn ? Getter[key] : () => HTMLElement | null;
    };
} & (Str extends object ? {
    givenState: {
        [k in keyof ReturnType<ReturnType<Str>["getState"]>]: (arg: ReturnType<ReturnType<Str>["getState"]>[k]) => IDriver<Comp, Props, Getter, Actions, Str>;
    };
} : never);
export declare function createDriver<T extends object, G extends IGetters, A extends IActions, S extends IStore | undefined>(Component: React.FC<T>, { getters, actions, createStore, }?: {
    getters?: G;
    actions?: A;
    createStore?: S;
}): IDriver<React.FC<T>, T, G, A, S>;
export {};
