type MethodDescriptor<T> = { value?: T };
type WithProperty<K extends string | number | symbol, T> =  { [k in K]: T };

export function bind<Key, Result>(
  cacher: (key: Key, loader: () => Result) => Result,
) {
  return <This, Arguments extends any[]>(
    fkey: (this: This, ...args: Arguments) => Key,
  ) => {
    type Method = (this: This, ...args: Arguments) => Result;
    return <Property extends string>(
      target: WithProperty<Property, Method>, method: Property,
      descriptor: MethodDescriptor<Method>
    ) => {
      const original = target[method];
      descriptor.value = function(this, ...args: Arguments) {
        const key = fkey.apply(this, args);
        return cacher(key, () => original.apply(this, args));
      };
    };
  };
}
