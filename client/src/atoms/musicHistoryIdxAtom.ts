import { atom } from 'recoil';

export const musicHistoryIdxAtom = atom<number>({
	key: 'musicHistoryIdx',
	default: 0,
});
