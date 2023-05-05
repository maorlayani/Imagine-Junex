import { atom } from 'recoil';

export const scoreHistoryIdxAtom = atom<number>({
	key: 'scoreHistoryIdx',
	default: 0,
});
