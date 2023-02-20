import { atom } from 'recoil';

export const diskSaveTimeAtom = atom<number>({
	key: 'diskSaveTime',
	default: 0,
});
