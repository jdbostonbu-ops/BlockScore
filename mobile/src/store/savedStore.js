import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "BLOCKSCORE_SAVED_ZIPS";

export async function getSavedZips() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function saveZip(zip) {
  try {
    const current = await getSavedZips();

    if (!current.includes(zip)) {
      const updated = [...current, zip];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }

    return current;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function removeZip(zip) {
  try {
    const current = await getSavedZips();

    const updated = current.filter((z) => z !== zip);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    return updated;
  } catch (err) {
    console.log(err);
    return [];
  }
}