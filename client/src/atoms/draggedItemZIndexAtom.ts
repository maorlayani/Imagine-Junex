import { atom } from 'recoil';

export const draggedItemZIndexAtom = atom<number>({
	key: 'draggedItemZIndex',
	default: 100,
});
