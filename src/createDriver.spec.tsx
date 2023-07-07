import React, { FC } from "react";
import { screen, fireEvent } from "@testing-library/react";
import { Chance } from "chance";
import { createDriver } from "./createDriver";

const chance = new Chance();

interface ComponentProps {
  name: string;
  onClick: () => void;
}

const Component: FC<ComponentProps> = ({ name, onClick }) => {
  return (
    <div data-testid="test-component">
      <span data-testid="test-name">{name}</span>
      <span data-testid="test-name1">{name}1</span>
      <span data-testid="test-name2">{name}2</span>
      <span data-testid="test-name3">{name}3</span>
      <span data-testid="test-name3">{name}3</span>
      <button data-testid="test-button" onClick={onClick}>
        Click me
      </button>
    </div>
  );
};

describe("DriverBuilder", () => {
  describe("given, getter", () => {
    it("should return a driver with given props", () => {
      const driver = createDriver(Component);
      expect(driver.given).toBeDefined();
      expect(driver.given.name).toBeDefined();
    });

    it("should return a driver with render method", () => {
      const driver = createDriver(Component);
      expect(driver.when).toBeDefined();
      expect(driver.when.render).toBeDefined();
    });

    it("should return a driver with get methods", () => {
      const driver = createDriver(Component, {
        getters: {
          container: "test-component",
        },
      });
      expect(driver.get).toBeDefined();
      expect(driver.get.container).toBeDefined();
    });

    it("should set name property", () => {
      const driver = createDriver(Component, {
        getters: {
          name: "test-name",
        },
      });

      const name = chance.word();
      driver.given.name(name).when.render();
      expect(driver.get.name()!.innerHTML).toEqual(name);
    });

    it("should have function getter", () => {
      const driver = createDriver(Component, {
        getters: {
          getTestName: (index: number) =>
            screen.queryByTestId(`test-name${index}`),
        },
      });
      const name = chance.word();
      driver.given.name(name).when.render();
      expect(driver.get.getTestName(2)!.innerHTML).toEqual(`${name}2`);
    });
  });

  describe("initialize", () => {
    it("should initialize", () => {
      const driver = createDriver(Component, {
        getters: {
          name: "test-name",
        },
      });
      const name = chance.word();
      driver.given.name(name).initialize().when.render();
      expect(driver.get.name()!.innerHTML).toEqual(``);
    });
  });

  describe("actions", () => {
    it("should have actions", () => {
      const driver = createDriver(Component, {
        getters: {
          button: "test-button",
        },
        actions: (get) => ({
          click: () => fireEvent.click(get.button()!)
        }),
      });
      driver.when.render();
      expect(driver.when.click).toBeDefined();
      expect(driver.when.click()).toBe(driver);
    });

    it("should spy on method props", () => {
      const driver = createDriver(Component, {
        getters: {
          button: "test-button",
        },
        actions: get => ({
          click: () => fireEvent.click(get.button()!)
        }),
      });
      const onClickSpy = jest.fn();
      driver.given.onClick(onClickSpy).when.render().when.click();
      expect(onClickSpy).toHaveBeenCalledTimes(1);
    });
  });
});
