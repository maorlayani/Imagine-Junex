import { atom } from 'recoil';

export interface SelectionItem {
	partInfoId: string;
	measureId: string;
	partId: string;
	noteId: string;
}

export const selectionAtom = atom<SelectionItem[]>({
	key: 'selection',
	default: [],
});
