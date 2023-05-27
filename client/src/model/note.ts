import { EntityKind, MeasureModel, MusicModel, NoteModel, PartModel, ScoreModel } from './scoreModel';
import { CommonHelper } from '../services/commonHelper';
import { MusicalHelper } from '../services/musicalHelper';
import { Part } from './part';

export class Note implements NoteModel {
	kind: EntityKind = EntityKind.NOTE;

	constructor(
		public id: string,
		public measureId: string,
		public partId: string,
		public fullName: string,
		public isRest: boolean,
		public startDiv: number,
		public durationDivs: number,
		public isTiedToNext: boolean,
		public isTiedToPrev: boolean,
		public isBoomwhacker: boolean,
	) {}

	static createFromModel(n: NoteModel) {
		return new Note(n.id, n.measureId, n.partId, n.fullName, n.isRest, n.startDiv, n.durationDivs, n.isTiedToNext, n.isTiedToPrev, n.isBoomwhacker);
	}

	static toggleAlter(n: NoteModel, useSharps: boolean) {
		const noteDetails = MusicalHelper.parseNote(n.fullName);
		if (!noteDetails.alter) {
			return;
		}
		if ((noteDetails.alter === '#' && useSharps) || (noteDetails.alter === 'b' && !useSharps)) {
			return;
		}
		n.fullName = MusicalHelper.toggleSharpAndFlat(n.fullName);
	}

	static resetIds(n: NoteModel, measureId: string, partId: string) {
		n.id = CommonHelper.getRandomId();
		n.measureId = measureId;
		n.partId = partId;
	}

	static getTiedNote(note: NoteModel, score: ScoreModel, isNext: boolean): NoteModel {
		const { measures } = score.music;
		const measureIdx = measures.findIndex((m) => m.id === note.measureId);
		const partIdx = measures[measureIdx].parts.findIndex((p) => p.id === note.partId);
		if (!isNext) {
			const lastNoteIdx = measures[measureIdx - 1].parts[partIdx].notes.length - 1;
			return measures[measureIdx - 1].parts[partIdx].notes[lastNoteIdx];
		}
		return measures[measureIdx + 1].parts[partIdx].notes[0];
	}

	// todo: I might just take the score as the parameter instead of all these.. But it is likely to be a much worse solution due to complexity
	// todo: Also no need for the new Note()
	static addTiedNote(note: NoteModel, part: PartModel, measure: MeasureModel, music: MusicModel, tiedDivs: number) {
		// find the index of the selected part, for a reference in the next measure
		const partIdx = measure.parts.findIndex((p) => p.id === part.id);
		// run through the score to get the next measure, and then get the part of the same index
		const nextMeasureIdx = music.measures.findIndex((m) => m.id === measure.id) + 1;
		const nextPart = music.measures[nextMeasureIdx].parts[partIdx];
		// define the first note of the corresponding part and set it's duration
		const { beatDurationDivs } = MusicalHelper.parseTimeSignature(measure.timeSignature);

		// const tiedNote = new Note(CommonHelper.getRandomId(), nextPart.measureId, nextPart.id, note.fullName, false, 0, beatDurationDivs, false, true, false);
		note.isTiedToNext = true;
		// tiedNote.isTiedToPrev = true;
		// nextPart.notes[0] = tiedNote;
		nextPart.notes[0] = {
			...nextPart.notes[0],
			fullName: note.fullName,
			isRest: note.isRest,
			isTiedToPrev: true,
		};
		if (tiedDivs !== beatDurationDivs) Part.changeNoteDuration(nextPart, nextPart.notes[0].id, tiedDivs, measure, music, false);
	}
}
