const DEFAULT_MS = 12_000;

export function withTimeout(promise, ms = DEFAULT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('request_timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
