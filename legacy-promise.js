/* Local adapters for ZotFile's generator API; do not modify Zotero globals. */
var ZotFileLegacyPromise = class extends Promise {
  static coroutine(generator) {
    return function (...args) {
      const owner = this;
      return new ZotFileLegacyPromise((resolve, reject) => {
        let iterator;
        try { iterator = generator.apply(owner, args); } catch (error) { reject(error); return; }
        function step(method, value) {
          let result;
          try { result = iterator[method](value); } catch (error) { reject(error); return; }
          if (result.done) { resolve(result.value); return; }
          Promise.resolve(result.value).then(value => step("next", value), error => step("throw", error));
        }
        step("next");
      });
    };
  }
  static async filter(values, predicate) {
    values = await values;
    const included = await Promise.all(values.map((value, index) => predicate(value, index)));
    return values.filter((_, index) => included[index]);
  }
  static delay(ms) { return new ZotFileLegacyPromise(resolve => setTimeout(resolve, ms)); }
};
if (typeof module !== "undefined") module.exports = ZotFileLegacyPromise;
