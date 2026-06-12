declare namespace jest {
  interface Mock<T = unknown, A extends unknown[] = unknown[]> {
    (...args: A): T;
    mockResolvedValue(value: Awaited<T>): this;
    mockRejectedValue(value: unknown): this;
    mockReturnValue(value: T): this;
  }

  function fn<T = unknown, A extends unknown[] = unknown[]>(
    implementation?: (...args: A) => T,
  ): Mock<T, A>;

  function setTimeout(timeout: number): void;
}

declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => unknown): void;
declare function beforeEach(fn: () => unknown): void;
declare function beforeAll(fn: () => unknown): void;
declare function afterEach(fn: () => unknown): void;
declare function afterAll(fn: () => unknown): void;

declare function expect(actual: unknown): {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toContain(expected: unknown): void;
  toHaveBeenCalled(): void;
  toHaveBeenCalledTimes(count: number): void;
  toHaveBeenCalledWith(...args: unknown[]): void;
  toMatchObject(expected: unknown): void;
  toThrow(expected?: unknown): void;
  not: ReturnType<typeof expect>;
  resolves: ReturnType<typeof expect>;
  rejects: ReturnType<typeof expect>;
};

declare namespace expect {
  function objectContaining<T extends object>(value: T): T;
}
