# Driver Pattern

A project for generating react test drivers.

Features:
* Automatic react component property setters
* Automatic redux state setters
* Easily declare getters
* Easily declare actions

## Usage

You can see usage examples in the test file, those are some cherry-picked exmaples:

Automatically created "givens" based on properties & declared getters:
```ts

const NameComponent: FC<ComponentProps> = ({ name }: { name: string }) => (
  <span data-testid="test-name">{name}</span>
);

const driver = createDriver(NameComponent, {
  getters: {
    name: "test-name",
  },
});

driver.given.name("Some Name").when.render();
expect(driver.get.name()!.innerHTML).toEqual("Some Name");
```

Actions:
```ts
const driver = createDriver(Component, {
  getters: {
    button: "test-button",
  },
  actions: {
    click: () => {
      fireEvent.click(driver.get.button()!);
    },
  },
});
const onClickSpy = jest.fn();
driver.given.onClick(onClickSpy).when.render().when.click();
expect(onClickSpy).toHaveBeenCalledTimes(1);
```

Supprt for redux state:
```ts
const driver = createDriver(ReduxComponent, {
  getters: {
    title: "test-redux-title",
  },
  createStore,
});
driver.givenState.title("Some Title").when.render();
expect(driver.get.title()!.innerHTML).toEqual("Some Title");
```