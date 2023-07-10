import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { IGetters, IActions, ICreateStore, IDriver, Fn } from './createDriver.types';

export function createDriver<
  ComponentProps extends object,
  ActionsInit extends (get: IDriver<any, Getters, any, any>['get']) => IActions,
  CreateStore extends ICreateStore | undefined,
  Getters extends IGetters,

  // Derived types
  DefaultProps extends () => Partial<ComponentProps>,
  DefaultState extends CreateStore extends ICreateStore ? () => Partial<ReturnType<ReturnType<CreateStore>["getState"]>> : never,
>(
  Component: React.FC<ComponentProps>,
  {
    defaultProps,
    defaultState,
    getters,
    actions,
    createStore,
  }: { defaultProps?: DefaultProps, defaultState?: DefaultState, getters?: Getters, actions?: ActionsInit; createStore?: CreateStore } = {}
) {
  let props: Record<string, unknown> = { ...defaultProps?.() || {} };
  let state: Record<string, unknown> = { ...defaultState?.() };

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

  const acts = actions ? actions(getBuilder as any) : {} as IActions;

  const built: Record<string, unknown> = {
    initialize: () => {
      props = { ...defaultProps?.() };
      state = { ...defaultState?.() };
      return built;
    },
    given: givenProxy,
    givenState: givenStateProxy,
    on: {
      ...(acts &&
        Object.keys(acts).reduce(
          (arr, key) => ({
            ...arr,
            [key]: (...args: any[]) => {
              const returnType = acts[key](...args);
              const isReturnTypePromise = returnType instanceof Promise;
              if (isReturnTypePromise) {
                return returnType.then(() => built);
              }
              return built;
            },
          }),
          {}
        )),
    },
    when: {
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

  return built as unknown as IDriver<ComponentProps, Getters, ReturnType<ActionsInit>, CreateStore>;
}
