# Driver Pattern

A project for generating react test drivers.

Features:
* Automatic react component property setters
* Automatic redux state setters
* Easily declare getters
* Easily declare actions

Resources:
[BDD feat. Driver & Builder Patterns](https://morshemesh.medium.com/bdd-feat-driver-builder-patterns-57b4ad63e614)

# Usage

You can see usage examples in the test file, those are some cherry-picked exmaples:

## Givens & Getters
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

## Actions:
Actions are defined as a function which receives a get parameter, giving you access to the the get object infered from getters.
Simply put, you can use `driver.get.someGetter()` when performing actions:

```ts
const driver = createDriver(Component, {
  getters: {
    button: "test-button",
  },
  actions: get => ({
    click: () => fireEvent.click(driver.get.button()!),
  }),
});
const onClickSpy = jest.fn();
driver.given.onClick(onClickSpy).when.render().when.click();
expect(onClickSpy).toHaveBeenCalledTimes(1);
```

## Supprt for redux state:
Receives a createStore method, which:
* returns a redux Store (enabling to infer the store state)
* receives a preloadedState state, enabling the driver to inject an initial state

```ts

const createStore = ({ preloadedState }: { preloadedState: any }) => configureStore(...);

const driver = createDriver(ReduxComponent, {
  getters: {
    title: "test-redux-title",
  },
  createStore,
});
driver.givenState.title("Some Title").when.render();
expect(driver.get.title()!.innerHTML).toEqual("Some Title");
```