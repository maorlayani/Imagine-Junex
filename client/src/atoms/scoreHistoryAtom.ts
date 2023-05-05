import { atom } from 'recoil';
import { ScoreModel } from '../model/scoreModel';

export const scoreHistoryAtom = atom<ScoreModel[]>({
	key: 'scoreHistory',
	default: [],
});
