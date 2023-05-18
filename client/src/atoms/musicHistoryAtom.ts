import { atom } from 'recoil';
import { MusicModel } from '../model/scoreModel';

export const musicHistoryAtom = atom<MusicModel[]>({
	key: 'musicHistory',
	default: [],
});
