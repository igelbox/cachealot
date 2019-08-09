import { bind } from './classes';

describe('class cache', () => {
  describe('sync', () => {
    function newSyncMemCache<T>() {
      const cache = new Map<string, [T]>();
      return bind<string, T>((key: string, loader) => {
        let result = cache.get(key);
        if (!result) {
          result = [loader()];
          cache.set(key, result);
        }
        return result[0];
      });
    }

    const cache = newSyncMemCache();
    class Test {
      @cache((x: number) => String(x))
      public cached(x: number) {
        return this.impl(x);
      }

      public impl(x: number) {
        return x * x;
      }
    }

    it('works', () => {
      const test = new Test();
      spyOn(test, 'impl').and.callThrough();

      expect(test.cached(2)).toEqual(4);
      expect(test.impl).toHaveBeenCalledTimes(1);

      expect(test.cached(3)).toEqual(9);
      expect(test.impl).toHaveBeenCalledTimes(2);

      expect(test.cached(2)).toEqual(4);
      expect(test.impl).toHaveBeenCalledTimes(2);
    });
  });

  describe('async', () => {
    function newAsyncMemCache<T>() {
      const cache = new Map<string, [T]>();
      return bind<string, Promise<T>>(async (key: string, loader) => {
        let result = cache.get(key);
        if (!result) {
          result = [await loader()];
          cache.set(key, result);
        }
        return result[0];
      });
    }

    const cache = newAsyncMemCache();
    class Test {
      @cache((x: number) => String(x))
      public async cached(x: number) {
        return this.impl(x);
      }

      public impl(x: number) {
        return x * x;
      }
    }

    it('works', async () => {
      const test = new Test();
      spyOn(test, 'impl').and.callThrough();

      expect(await test.cached(2)).toEqual(4);
      expect(test.impl).toHaveBeenCalledTimes(1);

      expect(await test.cached(3)).toEqual(9);
      expect(test.impl).toHaveBeenCalledTimes(2);

      expect(await test.cached(2)).toEqual(4);
      expect(test.impl).toHaveBeenCalledTimes(2);
    });
  });
});
