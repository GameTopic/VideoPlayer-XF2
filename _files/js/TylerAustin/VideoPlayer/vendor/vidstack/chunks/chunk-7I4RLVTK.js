// node_modules/vidstack/prod/chunks/vidstack-LrKZmdyw.js
var LocalStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch {
    }
  }
};

export {
  LocalStorage
};
