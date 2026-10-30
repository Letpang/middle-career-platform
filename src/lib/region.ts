// 상단에서 고른 "우리 지역". 홈의 일자리·센터가 이 지역으로 바뀝니다. 이 브라우저에만 저장합니다.
import { DEFAULT_REGION, findRegion, type Region } from '../data/regions';
import { loadProfile } from './profile';

const KEY = 'career_bridge_region';

export function loadHomeRegion(): Region {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {
    // ignore
  }
  return findRegion(saved) || findRegion(loadProfile()?.region) || findRegion(DEFAULT_REGION)!;
}

export function saveHomeRegion(key: string) {
  try {
    localStorage.setItem(KEY, key);
  } catch {
    // ignore
  }
}
