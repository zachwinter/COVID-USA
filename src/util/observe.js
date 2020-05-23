export function isPrimitive (val) {
  const type = typeof val
  return val == null || (type != 'object' && type != 'function')
}

/**
 * @function Observe – Returns a Proxy allowing mutation observation on objects.
 * @param {Object} target – Object to observe.
 *
 * NOTE: Doesn't do deep watching. Any nested objects need to be wrapped as well.
 *
 * const obj = Observe({
 *   foo: 'bar'
 * })
 *
 * Watch all keys:
 * obj.watch((val, old) => console.log(val, old))
 *
 * Watch single key:
 * obj.watch('foo', (val, old) => console.log(val, old))
 *
 * obj.foo = 'lmao'
 * // => 'lmao', 'bar'
 */
export default function Observe (target) {
  let _target = {...target}

  /** Store observers for the entire object. */
  let _observers = {
    __all__: []
  }

  /** Store observers for individual keys. */
  for (var key in _target) {
    _observers[key] = []
  }

  /** Hijack the `set` method for sweet interception action. */
  const traps = {
    set (obj, key, val) {
      let old

      if (isPrimitive(obj[key])) {
        old = obj[key]
      } else if (Array.isArray(obj[key])) {
        old = [...obj[key]]
      } else {
        old = {...obj[key]}
      }

      obj[key] = val

      if (_observers[key]) {
        _observers[key].map(({ callback }) => callback(val, old))
        _observers.__all__.map(({ callback }) => callback({ key, value: val, old }))
      }

      return true
    }
  }

  Object.defineProperty(_target, 'watch', {
    enumerable: false,
    value: function (key, callback) {
      /** Watch a single key. */
      if (typeof key === 'string') {
        if (key in _observers) {
          const id = performance.now()
          _observers[key].push({ callback, id })
          return { key, id }
        }
      }

      /** Watch entire object. */
      if (typeof key === 'function') {
        const id = performance.now()
        _observers.__all__.push({ callback: key, id })
        return { key, id }
      }
    }
  })

  Object.defineProperty(_target, 'unwatch', {
    enumerable: false,
    value: function (key, id = null) {
      if (id === null) return (_observers.__all__ = _observers.__all__.filter(({ id }) => id !== key))
      _observers[key] = _observers[key].filter(({ id: _id }) => _id !== id)
    }
  })

  return new Proxy(_target, { set: traps.set })
}