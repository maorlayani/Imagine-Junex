import { EntityKind, MeasureModel, MusicModel, NoteModel, PartModel, PartType } from './scoreModel';
import { CommonHelper } from '../services/commonHelper';
import { MusicalHelper } from '../services/musicalHelper';
import { PartInfo } from './partInfo';
import { Note } from './note';
import { Chord } from './chord';
import { SelectionItem } from '../atoms/selectionAtom';

export class Part implements PartModel {
	kind: EntityKind = EntityKind.PART;

	constructor(
		public id: string,
		public partInfoId: string,
		public measureId: string,
		public partType: PartType,
		public text: string,
		public notes: Note[],
		public chords: Chord[],
	) {}

	static createNew(measureId: string, partInfo: PartInfo, timeSignature: string) {
		const id = CommonHelper.getRandomId();
		const notes = [];
		if (partInfo.partType === PartType.FN_LVL_1) {
			const { beats, beatDurationDivs } = MusicalHelper.parseTimeSignature(timeSignature);
			for (let i = 0; i < beats; i++) {
				const note = new Note(CommonHelper.getRandomId(), measureId, id, '', true, i * beatDurationDivs, beatDurationDivs, false, false, false);
				notes.push(note);
			}
		}
		return new Part(id, partInfo.id, measureId, partInfo.partType, '', notes, []);
	}

	static createFromModel(p: PartModel) {
		const notes: Note[] = [];
		p.notes.forEach((n) => {
			const note = Note.createFromModel(n);
			notes.push(note);
		});
		const chords: Chord[] = [];
		p.chords.forEach((c) => {
			const chord = Chord.createFromModel(c);
			chords.push(chord);
		});
		return new Part(p.id, p.partInfoId, p.measureId, p.partType, p.text, notes, chords);
	}

	static findNote(p: PartModel, noteId: string): NoteModel | null {
		return p.notes.find((n) => n.id === noteId) || null;
	}

	static canChangeNoteDuration(p: PartModel, noteId: string, newDurationDivs: number, measureDurationDivs: number, isLastMeasure: boolean): boolean {
		if (p.partType !== PartType.FN_LVL_1) {
			return false;
		}
		const n = Part.findNote(p, noteId);
		// if note exists: in case it is the last measure, see if it doesnt over pass it
		if (n && isLastMeasure && n.startDiv + newDurationDivs > measureDurationDivs) return false;
		// if note exists and it isnt already the same duration defined to it
		return !!n && n.durationDivs !== newDurationDivs;

		// Uri's original code:
		// return !!n && n.durationDivs !== newDurationDivs && n.startDiv + newDurationDivs <= measureDurationDivs;
	}

	static changeNoteDuration(p: PartModel, noteId: string, newDurationDivs: number, measure: MeasureModel, music: MusicModel, isLastMeasure: boolean, selection?: SelectionItem) {
		if (!Part.canChangeNoteDuration(p, noteId, newDurationDivs, measure.durationDivs, isLastMeasure)) {
			return;
		}
		const targetNote = Part.findNote(p, noteId);
		if (!targetNote) {
			return;
		}
		const targetNoteIndex = p.notes.findIndex((n) => n.id === noteId);
		const deltaDivs = newDurationDivs - targetNote.durationDivs;
		const isShorting = deltaDivs < 0;
		if (isShorting) {
			targetNote.durationDivs = newDurationDivs;
			const curStartDivs = targetNote.startDiv + targetNote.durationDivs;
			const newNote = new Note(CommonHelper.getRandomId(), targetNote.measureId, targetNote.partId, '', true, curStartDivs, -deltaDivs, false, false, false);
			p.notes.splice(targetNoteIndex + 1, 0, newNote);
			if (targetNote.durationDivs + targetNote.startDiv <= measure.durationDivs) {
				targetNote.isTiedToNext = false;
				//todo find the next note
				Note.getTiedNote(targetNote, music, true).isTiedToPrev = false;
			}
		} else {
			targetNote.durationDivs = newDurationDivs;
			// if the selected note is not the last note
			if (p.notes.length > targetNoteIndex + 1) {
				const nextNote = p.notes[targetNoteIndex + 1];
				nextNote.durationDivs = nextNote.durationDivs - deltaDivs;
				// set the length of the next note (to complete to a quarter or so on)
				if (nextNote.durationDivs <= 0) {
					if ([6, 18].includes(newDurationDivs)) {
						nextNote.durationDivs = 6;
					} else if ([12, 36].includes(newDurationDivs)) {
						nextNote.durationDivs = 12;
					} else {
						nextNote.durationDivs = 24;
					}
				}
			}
			// since number of notes per measure can change (1/2, 3/8 etc.) this index will tell us how many notes will be in the part when we finish parsing
			let lastOkIndex = -1;
			let tiedDivs = 0;
			p.notes[p.notes.length - 1].durationDivs = measure.durationDivs;
			p.notes.forEach((n, i) => {
				// set every note to start at the beginning of where the last note ended
				n.startDiv = i === 0 ? 0 : p.notes[i - 1].startDiv + p.notes[i - 1].durationDivs;
				const endDiv = n.startDiv + n.durationDivs;
				// if the note ends after the measure
				// important: this can happen several times in a loop, since we hadn't cut all parts to the measure length yet..
				if (endDiv >= measure.durationDivs) {
					// if we are at the last index, save the remaining divs about to cut
					n.durationDivs = Math.max(n.durationDivs - (endDiv - measure.durationDivs), 0);
					if (n.durationDivs > 0) {
						lastOkIndex = i;
						//! need to test this if duration changing still works. done 27/05/2023 erez
						// if (n.id === selection?.noteId) {
						if (n.id === noteId) {
							tiedDivs = n.startDiv + newDurationDivs - measure.durationDivs;
						}
					}
				}
			});
			// if we got any divs cut to fit into the measure, add a tied note at the next one
			if (tiedDivs) {
				Note.addTiedNote(p.notes[lastOkIndex], p, measure, music, tiedDivs);
			} else {
				targetNote.isTiedToNext = false;
			}
			if (lastOkIndex > -1) {
				p.notes.length = lastOkIndex + 1;
			}
		}
	}

	static toggleNotesAlter(p: PartModel, useSharps: boolean) {
		if (p.partType !== PartType.FN_LVL_1) {
			return;
		}
		p.notes.forEach((n) => {
			Note.toggleAlter(n, useSharps);
		});
	}

	static resetIds(p: PartModel, measureId: string) {
		p.id = CommonHelper.getRandomId();
		p.measureId = measureId;
		p.notes.forEach((n) => {
			Note.resetIds(n, measureId, p.id);
		});
		p.chords.forEach((c) => {
			Chord.resetIds(c, measureId, p.id);
		});
	}
}
