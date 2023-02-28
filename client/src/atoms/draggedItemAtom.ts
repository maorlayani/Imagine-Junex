import { atom } from 'recoil';

export enum DraggedItemType {
	PIANO_PANEL = 'PIANO_PANEL',
	NOTE_PANEL = 'NOTE_PANEL',
	MEASURE_PANEL = 'MEASURE_PANEL',
	PARTS_PANEL = 'PARTS_PANEL',
	BW_PANEL = 'BW_PANEL', //BoomWhacker panel
	NA = 'NA',
}

export const draggedItemAtom = atom<DraggedItemType>({
	key: 'draggedItem',
	default: DraggedItemType.NA,
});
