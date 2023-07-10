import { Chance } from "chance";
import { createDriver } from "./createDriver";
import { ReduxComponent, createStore } from "./app-mock/ReduxApp";
import { cleanup } from '@testing-library/react';

const chance = new Chance();

describe("redux", () => {
  it("should define redux state", () => {
    const driver = createDriver(ReduxComponent, { createStore });
    expect(driver.givenState).toBeDefined();
    expect(driver.givenState.title).toBeDefined();
  });

  it("should add redux state", () => {
    const driver = createDriver(ReduxComponent, {
      getters: {
        title: "test-redux-title",
      },
      createStore,
    });
    const title = chance.word();
    driver.givenState.title(title).when.render();
    expect(driver.get.title()!.innerHTML).toEqual(title);
  });

  it("should get default state from defaultState", () => {
    const title = chance.word();
    const driver = createDriver(ReduxComponent, {
      getters: {
        title: "test-redux-title",
      },
      createStore,
      defaultState: () => ({ title }),
    });
    driver.when.render();
    expect(driver.get.title()!.innerHTML).toEqual(title);
  });

  it("should initialize from defaultState", () => {
    const driver = createDriver(ReduxComponent, {
      getters: {
        title: "test-redux-title",
      },
      createStore,
      defaultState: () => ({ title: chance.word() }),
    });
    driver.when.render();
    const render1 = driver.get.title()!.innerHTML;
    cleanup();
    driver.initialize().when.render();
    const render2 = driver.get.title()!.innerHTML;
    expect(render1).not.toEqual(render2);
  });
});
