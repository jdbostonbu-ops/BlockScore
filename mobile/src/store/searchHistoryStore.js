import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "BLOCKSCORE_SEARCH_HISTORY";

export async function getSearchHistory() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function addSearchHistory(zip) {
  try {
    if (!zip) return [];

    const current = await getSearchHistory();
    const updated = [zip, ...current.filter((item) => item !== zip)].slice(0, 5);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function clearSearchHistory() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (err) {
    console.log(err);
    return [];
  }
}