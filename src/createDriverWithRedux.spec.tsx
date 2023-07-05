import { Chance } from "chance";
import { createDriver } from "./createDriver";
import { ReduxComponent, createStore } from "./app-mock/ReduxApp";

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
});
