import AsyncStorage from "@react-native-async-storage/async-storage";

const localStorage = {
  // Save a string item
  saveItem: (key: string, item: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      AsyncStorage.setItem(key, item)
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  },

  // Remove an item
  removeItem: (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      AsyncStorage.removeItem(key)
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  },

  // Get a string item
  getItem: (key: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem(key)
        .then((res) => resolve(res))
        .catch((error) => reject(error));
    });
  },

  // Save an object
  setObject: (key: string, item: object): Promise<void> => {
    return new Promise((resolve, reject) => {
      AsyncStorage.setItem(key, JSON.stringify(item))
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  },

  // Get an object
  getObject: <T>(key: string): Promise<T | null> => {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem(key)
        .then((res) => {
          if (res) {
            console.log(`${key} =`, JSON.parse(res));
            resolve(JSON.parse(res) as T);
          } else {
            resolve(null);
          }
        })
        .catch((error) => reject(error));
    });
  },

  // Clear all storage
  clear: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      AsyncStorage.clear()
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  }
};

export default localStorage;
