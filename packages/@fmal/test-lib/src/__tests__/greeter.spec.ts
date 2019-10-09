import { Greeter } from '../greeter';

describe('Greeter', () => {
  let greeter: Greeter;

  beforeEach(() => {
    greeter = new Greeter('World');
  });

  it('greets', () => {
    const actual = greeter.greet();

    expect(actual).toMatchSnapshot();
  });

  it('logs the greeting each time greet is called', () => {
    const spyLog = jest.spyOn(console, 'log');
    greeter.greet();

    expect(spyLog).toHaveBeenCalledWith('Hello, World!');
  });
});
