export class Greeter {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet(): string {
    const result = `Hello, ${this.name}!`;
    console.log(result);
    return result;
  }
}
