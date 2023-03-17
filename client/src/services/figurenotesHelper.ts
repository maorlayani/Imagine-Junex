import { NoteModel } from '../model/scoreModel';
import { MusicalHelper } from './musicalHelper';
export enum FnOctaveShape {
	'X' = 'X',
	'SQUARE' = 'SQUARE',
	'CIRCLE' = 'CIRCLE',
	'TRIANGLE' = 'TRIANGLE',
	'RHOMBUS' = 'RHOMBUS',
	'NA' = 'NA',
	'BW_SP' = 'BW_SP', //a special case for the octave note on the Boomwhacker
}

export class FigurenotesHelper {
	static getOctaveShape(octaveNumber: number, isBoomwhacker: boolean | undefined): FnOctaveShape {
		if (isBoomwhacker && octaveNumber === 5) return FnOctaveShape.BW_SP;
		if (octaveNumber >= 0 && octaveNumber <= 6) {
			return [FnOctaveShape.NA, FnOctaveShape.NA, FnOctaveShape.X, FnOctaveShape.SQUARE, FnOctaveShape.CIRCLE, FnOctaveShape.TRIANGLE, FnOctaveShape.RHOMBUS][octaveNumber];
		} else {
			return FnOctaveShape.NA;
		}
	}
	static getNoteColor(noteName: string, isBoomWhacker = false): string {
		if (isBoomWhacker) {
			return (
				{
					C: '#FE0000',
					B: '#FF00FE',
					A: '#9A00FA',
					G: '#196F3E',
					F: '#01FF00',
					E: '#FFFF00',
					D: '#FC9A01',
				}[noteName[0]] || ''
			);
		}
		return (
			{
				// C: '#ef2f2c', color in Uri's version
				C: '#FF0000',
				// D: '#8b5e37', color in Uri's version
				D: '#A97544',
				// E: '#bbbbb9', color in Uri's version
				E: '#D1CCC0',
				// F: '#1e8ece', color in Uri's version
				F: '#1BA7D4',
				// G: '#0c0d11', color in Uri's version
				G: '#000000',
				// A: '#f0e52b', color in Uri's version
				// A: '#e7db10',
				A: '#F9E738',
				// B: '#38ac49', color in Uri's version
				B: '#2AB442',
			}[noteName[0]] || ''
		);
	}
	static getWhiteIndices(): number[] {
		return [0, 2, 4, 5, 7, 9, 11];
	}
	static getBlackIndices(): number[] {
		return [1, 3, 6, 8, 10];
	}
	static getSymbolStyle(noteFullName: string, size: number, units: string, note?: NoteModel) {
		let style: any;
		const noteDetails = MusicalHelper.parseNote(noteFullName);
		const octaveShape = FigurenotesHelper.getOctaveShape(noteDetails.octave, note?.isBoomwhacker);
		const noteColor = FigurenotesHelper.getNoteColor(noteDetails.step, note?.isBoomwhacker);
		if (note?.isTiedToPrev) {
			style = {
				// top: `${size / 2}${units}`,
				// left: `${-size / 2}${units}`,
				// width: `${size + 3}${units}`,
				// height: `${size / 2}${units}`,
				// borderStyle: 'solid',
				// borderColor: 'black',
				// borderWidth: '1.5px 1.5px 1.5px 0',
				// backgroundColor: `${noteColor}`,
				// zIndex: -1,
			};
			return style;
		}
		switch (octaveShape) {
			case FnOctaveShape.X: {
				style = {
					width: `${size}${units}`,
					height: `${size}${units}`,
					left: '1.5px',
					background: _setBackgroundX(noteColor),
					// background: `linear-gradient(45deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 35%, ${noteColor} 35%, ${noteColor} 65%, rgba(0,0,0,0) 65%, rgba(0,0,0,0) 100%), linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 35%, ${noteColor} 35%, ${noteColor} 65%, rgba(0,0,0,0) 65%, rgba(0,0,0,0) 100%)`,
					//borderRadius: `10%`,
				};
				break;
			}
			case FnOctaveShape.SQUARE: {
				style = {
					width: `${size}${units}`,
					height: `${size}${units}`,
					backgroundColor: `${noteColor}`,
					border: '1.5px solid',
					zIndex: '20',
					//borderRadius: `10%`,
				};
				break;
			}
			case FnOctaveShape.CIRCLE: {
				style = {
					width: `${size}${units}`,
					height: `${size}${units}`,
					background: `radial-gradient(${noteColor} 67%, rgb(0, 0, 0) 70%, rgb(255,255,255) 73%)`,
					zIndex: '20',
					// backgroundColor: `${noteColor}`,
					borderRadius: `50%`,
				};
				break;
			}
			case FnOctaveShape.TRIANGLE: {
				style = {
					// width: `0`,
					// height: `0`,
					// borderLeft: `${size / 2}${units} solid transparent`,
					// borderRight: `${size / 2}${units} solid transparent`,
					// borderBottom: `${size}${units} solid ${noteColor}`,
					//borderRadius: `10%`,
					width: `${size}${units}`,
					height: `${size}${units}`,
					background: `linear-gradient(0deg, black 0%, transparent 3%), linear-gradient(116.5deg, white 30%, black 32%, transparent 34%), linear-gradient(-116.5deg, transparent 30%, black 32%, ${noteColor} 34%)`,
					zIndex: '20',
				};
				break;
			}
			case FnOctaveShape.RHOMBUS: {
				style = {
					width: `${size}${units}`,
					height: `${size}${units}`,
					backgroundColor: `${noteColor}`,
					transform: `rotate(45deg) scale(0.71)`,
					transformOrigin: `${size / 2}${units} ${size / 2}${units}`,
					border: '1.5px solid',
					zIndex: '20',
					//borderRadius: `10%`,
				};
				break;
			}
			case FnOctaveShape.BW_SP: {
				style = {
					width: `${size}${units}`,
					height: `${size}${units}`,
					background: `radial-gradient(rgb(255,255,255) 29%, rgb(0,0,0) 33%, ${noteColor} 37%, ${noteColor} 67%, rgb(0, 0, 0) 70%, transparent 73%)`,
				};
				break;
			}
			default: {
				style = {};
				break;
			}
		}

		return style;
	}

	static parseTail(note: NoteModel, quarterSize: number) {
		let leftValue = 0;
		let widthValue = 0;
		// width:
		// if note is tied, add in 1/2 of the quarterSize either for a seamless transition with the next, or to cover up reducing the left value with prev
		widthValue = Math.max(quarterSize / 2 - 1 + ((note.durationDivs - 24) * quarterSize) / 24, quarterSize / 2);
		if (note.isTiedToPrev && note.durationDivs > 24) widthValue += quarterSize / 2;
		
		// left
		// if tied to previous left is 0, else start at the half of the original note block
		leftValue = note.isTiedToPrev ? 0 : quarterSize / 2 - 1;
		if (note.isTiedToNext) {
			// slightly step into the next measure for more seamless transition
			widthValue += quarterSize / 16 - 1;
			if (MusicalHelper.parseNote(note.fullName).octave <= 3) {
				// the tail at the X shape notes starts slightly more to the right
				leftValue += quarterSize / 4.4;
			}
		}
		const left = leftValue + 'px';
		const width = widthValue + 'px';
		return { left, width };
	}
}

// Helper function: takes the note color and gives the complicated X shape with linear-gradients
function _setBackgroundX(color: string) {
	return `linear-gradient(to bottom right, white 11%, black 14%, transparent 15%),
			linear-gradient(to top left, white 11%, black 14%, transparent 15%),
			linear-gradient(to top right, white 11%, black 14%, transparent 15%),
			linear-gradient(to bottom left, white 11%, black 14%, transparent 15%),
			linear-gradient(to top right, transparent 36%, ${color} 37%, ${color} 62%, transparent 62%),
			linear-gradient(to bottom right, transparent 34%, black 36%, ${color} 37%, ${color} 62%, black 63%, transparent 65%),
			linear-gradient(to top right, transparent 34%, black 36%, ${color} 37%, ${color} 62%, black 63%, transparent 65%)`;
}
