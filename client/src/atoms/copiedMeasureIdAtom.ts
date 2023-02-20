import { atom } from 'recoil';

export const copiedMeasureIdAtom = atom<string>({
	key: 'copiedMeasureId',
	default: '',
});
