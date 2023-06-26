export function isPrimitive(val: any): boolean {
  const type = typeof val;
  return val == null || (type !== 'object' && type !== 'function');
}

type WatchCallback = (val: any, old?: any) => void;

interface Watcher {
  callback: WatchCallback;
  id: number;
}

type KeyObservers = Watcher[];
type Observers = {
  [key: string]: KeyObservers;
};

export default function Observe<T extends object>(target: T): T {
  let _target = { ...target };

  let _observers: Observers = {
    __all__: [],
  };

  for (var key in _target) {
    _observers[key] = [];
  }

  const traps = {
    set(obj: any, key: string, val: any): boolean {
      let old: any;

      if (isPrimitive(obj[key])) {
        old = obj[key];
      } else if (Array.isArray(obj[key])) {
        old = [...obj[key]];
      } else {
        old = { ...obj[key] };
      }

      obj[key] = val;

      if (_observers[key]) {
        _observers[key].forEach(({ callback }: Watcher) => callback(val, old));
        _observers.__all__.forEach(({ callback }: Watcher) =>
          callback({ key, value: val, old })
        );
      }

      return true;
    },
  };

  Object.defineProperty(_target, 'watch', {
    enumerable: false,
    value: function (
      key: string | WatchCallback,
      callback?: WatchCallback
    ): { key: string; id: number } | undefined {
      if (typeof key === 'string') {
        if (key in _observers) {
          const id = performance.now();
          _observers[key].push({ callback, id } as Watcher);
          return { key, id };
        }
      } else if (typeof key === 'function') {
        const id = performance.now();
        _observers.__all__.push({ callback: key, id } as Watcher);
        return { key: '__all__', id };
      }
    },
  });

  Object.defineProperty(_target, 'unwatch', {
    enumerable: false,
    value: function (
      key: string | WatchCallback,
      id: number | null = null
    ): void {
      if (typeof key === 'string') {
        if (id === null) {
          _observers[key] = [];
        } else {
          _observers[key] = _observers[key].filter(({ id: _id }) => _id !== id);
        }
      } else if (typeof key === 'function') {
        if (id === null) {
          _observers.__all__ = [];
        } else {
          _observers.__all__ = _observers.__all__.filter(
            ({ id: _id }) => _id !== id
          );
        }
      }
    },
  });

  return new Proxy(_target, traps);
}
