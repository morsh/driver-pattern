import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { IGetters, IActions, ICreateStore, IDriver } from './createDriver.types';

export function createDriver<
  ComponentProps extends object,
  Getters extends IGetters,
  Actions extends IActions,
  CreateStore extends ICreateStore | undefined
>(
  Component: React.FC<ComponentProps>,
  {
    getters,
    actions,
    createStore,
  }: { getters?: Getters; actions?: Actions; createStore?: CreateStore } = {}
) {
  let props: Record<string, unknown> = {};
  let state: Record<string, unknown> = {};

  const givenProxy = new Proxy(
    {},
    {
      get(_, prop) {
        return (arg: unknown): unknown => {
          // If no arguments passed return current value.
          props[prop.toString()] = arg;
          return built;
        };
      },
    }
  );

  const givenStateProxy = new Proxy(
    {},
    {
      get(_, prop) {
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
      get(_, prop) {
        return (...args: unknown[]): unknown => {
          const testIdOrGetterFn = (getters as any)[prop];
          if (typeof testIdOrGetterFn === "string") {
            return screen.queryByTestId(testIdOrGetterFn);
          }
          if (typeof testIdOrGetterFn === "function") {
            return testIdOrGetterFn(...args);
          }
          return testIdOrGetterFn;
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
    given: givenProxy,
    givenState: givenStateProxy,
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
              <Component {...(props as ComponentProps)} />
            </Provider>
          );
        } else {
          render(<Component {...(props as ComponentProps)} />);
        }
        return built;
      },
    },
    get: getBuilder,
  };

  return built as unknown as IDriver<ComponentProps, Getters, Actions, CreateStore>;
}
