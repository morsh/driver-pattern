import React from "react";
import { render, screen } from "@testing-library/react";
import { Store } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

type Fn = (...args: any) => any;

export type IGetters = Record<string, string | Fn>;

export type IActions = Record<string, Fn>;

export type IStore = (args: any) => Store;

export type IDriver<
  Comp extends React.FC<Props>,
  Props extends object,
  Getter extends object,
  Actions extends IActions,
  Str extends (IStore | undefined)
> = {
  initialize: () => IDriver<Comp, Props, Getter, Actions, Str>;
  given: {
    [k in keyof Props]-?: (
      arg: Props[k]
    ) => IDriver<Comp, Props, Getter, Actions, Str>;
  };
  when: {
    // [key in keyof Actions]: null;
    [key in keyof Actions | "render"]: key extends "render"
    ? () => IDriver<Comp, Props, Getter, Actions, Str>
    : (
      ...args: Parameters<Actions[key]>
    ) => IDriver<Comp, Props, Getter, Actions, Str>;
    // : Actions[key];
    // render: () => IDriver<Comp, Props, Getter, Actions>;
  };
  get: {
    [key in keyof Getter]-?: Getter[key] extends Fn
    ? Getter[key]
    : () => HTMLElement | null;
  };
} & (Str extends object
  ? {
    givenState: {
      [k in keyof ReturnType<ReturnType<Str>["getState"]>]: (
        arg: ReturnType<ReturnType<Str>["getState"]>[k]
      ) => IDriver<Comp, Props, Getter, Actions, Str>;
    };
  }
  : never);

export function createDriver<
  T extends object,
  G extends IGetters,
  A extends IActions,
  S extends IStore | undefined
>(
  Component: React.FC<T>,
  {
    getters,
    actions,
    createStore,
  }: { getters?: G; actions?: A; createStore?: S } = {}
) {
  let props: Record<string, unknown> = {};
  let state: Record<string, unknown> = {};

  const givenBuilder = new Proxy(
    {},
    {
      get(target, prop) {
        return (arg: unknown): unknown => {
          // If no arguments passed return current value.
          props[prop.toString()] = arg;
          return built;
        };
      },
    }
  );

  const givenStateBuilder = new Proxy(
    {},
    {
      get(target, prop) {
        return (arg: unknown): unknown => {
          // If no arguments passed return current value.
          state[prop.toString()] = arg;
          return built;
        };
      },
    }
  );

  const getBuilder = new Proxy(
    {},
    {
      get(target, prop) {
        return (...args: unknown[]): unknown => {
          const getterDefinition = (getters as any)[prop];
          if (typeof getterDefinition === "string") {
            return screen.queryByTestId(getterDefinition);
          }
          if (typeof getterDefinition === "function") {
            return getterDefinition(...args);
          }
          return getterDefinition;
        };
      },
    }
  );

  const built: Record<string, unknown> = {
    initialize: () => {
      props = {};
      state = {};
      return built;
    },
    given: givenBuilder,
    givenState: givenStateBuilder,
    when: {
      ...(actions &&
        Object.keys(actions).reduce(
          (arr, key) => ({
            ...arr,
            [key]: (...args: any[]) => {
              actions[key](...args);
              return built;
            },
          }),
          {}
        )),
      render: () => {
        if (createStore) {
          render(
            <Provider store={createStore({ preloadedState: state })}>
              <Component {...(props as T)} />
              );
            </Provider>
          );
        } else {
          render(<Component {...(props as T)} />);
        }
        return built;
      },
    },
    get: getBuilder,
  };

  return built as IDriver<React.FC<T>, T, G, A, S>;
}
