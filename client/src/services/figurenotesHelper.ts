import { MusicalHelper } from './musicalHelper';

export enum FnOctaveShape {
	'X' = 'X',
	'SQUARE' = 'SQUARE',
	'CIRCLE' = 'CIRCLE',
	'TRIANGLE' = 'TRIANGLE',
	'RHOMBUS' = 'RHOMBUS',
	'NA' = 'NA',
}

export class FigurenotesHelper {
	static getOctaveShape(octaveNumber: number): FnOctaveShape {
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
	static getSymbolStyle(noteFullName: string, size: number, units: string, isBoomWhacker: boolean | undefined) {
		let style: any;
		const noteDetails = MusicalHelper.parseNote(noteFullName);
		const octaveShape = FigurenotesHelper.getOctaveShape(noteDetails.octave);
		const noteColor = FigurenotesHelper.getNoteColor(noteDetails.step, isBoomWhacker);
		switch (octaveShape) {
			case FnOctaveShape.X: {
				style = {
					width: `${size}${units}`,
					height: `${size}${units}`,
					background: `linear-gradient(45deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 35%, ${noteColor} 35%, ${noteColor} 65%, rgba(0,0,0,0) 65%, rgba(0,0,0,0) 100%), linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 35%, ${noteColor} 35%, ${noteColor} 65%, rgba(0,0,0,0) 65%, rgba(0,0,0,0) 100%)`,
					//borderRadius: `10%`,
				};
				break;
			}
			case FnOctaveShape.SQUARE: {
				style = {
					width: `${size}${units}`,
					height: `${size}${units}`,
					backgroundColor: `${noteColor}`,
					//borderRadius: `10%`,
				};
				break;
			}
			case FnOctaveShape.CIRCLE: {
				style = {
					width: `${size}${units}`,
					height: `${size}${units}`,
					backgroundColor: `${noteColor}`,
					borderRadius: `50%`,
				};
				break;
			}
			case FnOctaveShape.TRIANGLE: {
				style = {
					width: `0`,
					height: `0`,
					borderLeft: `${size / 2}${units} solid transparent`,
					borderRight: `${size / 2}${units} solid transparent`,
					borderBottom: `${size}${units} solid ${noteColor}`,
					//borderRadius: `10%`,
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
					//borderRadius: `10%`,
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
}
