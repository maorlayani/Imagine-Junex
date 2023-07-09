import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { TextField, Typography } from '@material-ui/core';
import { MusicalHelper } from '../../services/musicalHelper';
import { MusicModel, NoteModel, PartModel, PartType } from '../../model/scoreModel';
import { ScoreSettings } from '../../model/scoreSettings';
import { Music } from '../../model/music';
import { selectionAtom } from '../../atoms/selectionAtom';
import { SoundHelper } from '../../services/soundHelper';
import { FigurenotesHelper } from '../../services/figurenotesHelper';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import { KeyboardHelper } from '../../services/keyboardHelper';

export interface MusicUIProps {
	music: MusicModel;
	scoreSettings: ScoreSettings;
}
export enum keyboardArrows {
	'ArrowRight' = 'ArrowRight',
	'ArrowLeft' = 'ArrowLeft',
	'ArrowUp' = 'ArrowUp',
	'ArrowDown' = 'ArrowDown'
}
export const MusicUI = ({ music, scoreSettings }: MusicUIProps) => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'relative',

			// '@media print and (orientation: landscape)': {
			// 	marginLeft: '25%',
			// },
		},
		row: {
			position: 'relative',
			display: 'flex',
			pageBreakInside: 'avoid',
			width: 'max-content',
			height: 'max-content',
		},
		measure: {
			// borderBlock: '2px solid #000',
			position: 'relative',
			// borderInlineStart: '2px solid #000',
			'&:last-child': {
				// borderInlineEnd: '2px solid #000',
			},
		},
		measureInnerBorders: {
			position: 'absolute',
			zIndex: 1,
			'&:not(:last-of-type)': {
				borderInlineEnd: '2px solid rgba(0,0,0,0.6)',
				// borderInlineEnd: '3px solid black',
			},
		},
		measureNumberAnchor: {
			position: 'absolute',
			top: 0,
			left: 0,
		},
		measureNumber: {
			position: 'absolute',
			top: -18,
			right: 2,
		},
		measureNumberText: {
			fontSize: '14px',
			fontWeight: 700,
		},
		melodyPartRoot: {
			border: '2px solid #000',
			display: 'flex',
		},
		partSpaceAbove: {
			marginTop: 20,
		},
		note: {
			position: 'relative',
			fontSize: 10,
			// borderInlineEnd: '1px dotted #000',
			borderBlock: '1px solid #eee',
			'&.selected': {
				backgroundColor: '#ddf',
				border: '1px solid #3f51b5',
			},
			'@media print': {
				backgroundColor: 'transparent !important',
				border: '1px solid #ddd !important',
			},
		},
		fnSymbolContainer: {
			position: 'absolute',
			left: 0,
			top: 0,
		},
		fnSymbol: {
			position: 'absolute',
		},
		longNoteTail: {
			position: 'absolute',
		},
		noteName: {
			position: 'absolute',
			fontFamily: 'Arial, sans-serif',
			color: '#fff',
		},
		alter: {
			position: 'absolute',
			top: -22,
			transformOrigin: 'center',
			'&.sharp': {
				transform: 'rotate(-45deg) translateY(3px) scale(1.6)',
			},
			'&.flat': {
				transform: 'rotate(-135deg) translateY(-3px) scale(1.6)',
			},
			zIndex: -1,
		},
		textPartRoot: {
			border: '1px solid #eee',
			display: 'flex',
			width: '100%',
			'& .MuiTextField-root': {
				width: '100%',
				'& .MuiInput-formControl': {
					width: '100%',
					'& .MuiInput-input': {
						width: '100%',
						padding: 2,
						fontFamily: 'Arial, sans-serif',
						color: '#000',
					},
				},
				'&.font-weight-bold .MuiInput-input': {
					fontWeight: 900,
				},
				'&.textSize-8 .MuiInput-input': {
					fontSize: '8px',
				},
				'&.textSize-9 .MuiInput-input': {
					fontSize: '9px',
				},
				'&.textSize-10 .MuiInput-input': {
					fontSize: '10px',
				},
				'&.textSize-11 .MuiInput-input': {
					fontSize: '11px',
				},
				'&.textSize-12 .MuiInput-input': {
					fontSize: '12px',
				},
				'&.textSize-13 .MuiInput-input': {
					fontSize: '13px',
				},
				'&.textSize-14 .MuiInput-input': {
					fontSize: '14px',
				},
				'&.textSize-15 .MuiInput-input': {
					fontSize: '15px',
				},
				'&.textSize-16 .MuiInput-input': {
					fontSize: '16px',
				},
				'&.textSize-17 .MuiInput-input': {
					fontSize: '17px',
				},
				'&.textSize-18 .MuiInput-input': {
					fontSize: '18px',
				},
				'&.textSize-19 .MuiInput-input': {
					fontSize: '19px',
				},
				'&.textSize-20 .MuiInput-input': {
					fontSize: '20px',
				},
				'&.textSize-21 .MuiInput-input': {
					fontSize: '21px',
				},
				'&.textSize-22 .MuiInput-input': {
					fontSize: '22px',
				},
				'&.textSize-23 .MuiInput-input': {
					fontSize: '23px',
				},
				'&.textSize-24 .MuiInput-input': {
					fontSize: '24px',
				},
			},
		},
	}));
	const classes = useStyles();
	const [selection, setSelection] = useRecoilState(selectionAtom);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyboardEvent)
		return () => document.removeEventListener("keydown", handleKeyboardEvent)
	})

	const sizeVars = useMemo(() => {
		const exampleMeasure = Music.getExampleMeasure(music);
		const timeData = MusicalHelper.parseTimeSignature(exampleMeasure.timeSignature);
		const partWidth = (4 * scoreSettings.quarterSize * timeData.beats) / timeData.beatType;
		const measureWidth = partWidth + 2;
		const spaceForMeasurementNumbers = 20;
		const numberOfMeasuresPerRow = Math.trunc((scoreSettings.musicWidth - spaceForMeasurementNumbers) / measureWidth);
		const leftGutter = (scoreSettings.musicWidth - measureWidth * numberOfMeasuresPerRow) / 2;
		const isQuarters = music.measures[0].timeSignature[2] === '4' ? true : false;
		return {
			numberOfMeasuresPerRow,
			partWidth,
			leftGutter,
			isQuarters,
		};
	}, [music, scoreSettings.musicWidth, scoreSettings.quarterSize]);

	const getPartInfo = useCallback(
		function getPartInfo(partInfoId: string) {
			return music.partsInfo.find((pi) => pi.id === partInfoId) || null;
		},
		[music],
	);
	const getRows = useCallback(
		function getRows() {
			if (music.measures.length === 0) {
				return [];
			}
			const rows: number[][] = [];
			let row: number[] = [];
			music.measures.forEach((m, i) => {
				row.push(i);
				if (m.isPickup || m.number % sizeVars.numberOfMeasuresPerRow === 0) {
					rows.push(row);
					row = [];
				}
			});
			if (row.length) {
				rows.push(row);
			}
			return rows;
		},
		[music, sizeVars.numberOfMeasuresPerRow],
	);
	const getNotesPerMeasure = useCallback(function timeSignatureToInt(timeSignature: string) {
		return [...Array(+timeSignature.charAt(0))];
	}, []);
	const getPartFontSize = useCallback(
		function getPartFontSize(partInfoId: string) {
			const partInfo = Music.findPartInfo(music, partInfoId);
			return partInfo?.fontSize || 0;
		},
		[music],
	);
	const handleClickNote = useCallback(
		function handleClickNote(e) {
			const note = Music.findNote(music, e.currentTarget.dataset.noteId);
			if (note) {
				const part = Music.findPart(music, note.partId);
				if (!part) {
					return;
				}
				setSelection([{ partInfoId: part.partInfoId, measureId: note.measureId, partId: note.partId, noteId: note.id }]);
				if (!note.isRest) {
					SoundHelper.playShortNote(note.fullName);
				}
			}
		},
		[music, setSelection],
	);

	const handleTextFocus = useCallback(
		function handleTextFocus(e) {
			setSelection([
				{
					partInfoId: e.target.parentElement.parentElement.dataset.partInfoId,
					measureId: e.target.parentElement.parentElement.dataset.msrId,
					partId: e.target.parentElement.parentElement.dataset.partId,
					noteId: '',
				},
			]);
		},
		[setSelection],
	);

	const handleTextChange = useCallback(
		function handleTextChange(e) {
			const part = Music.findPart(music, e.target.parentElement.parentElement.dataset.partId);
			if (part) {
				part.text = e.target.value;
			}
		},
		[music],
	);

	const handleTextBlur = useCallback(
		function handleTextBlur(e) {
			setSelection([
				{
					partInfoId: e.target.parentElement.parentElement.dataset.partInfoId,
					measureId: e.target.parentElement.parentElement.dataset.msrId,
					partId: e.target.parentElement.parentElement.dataset.partId,
					noteId: '',
				},
			]);
		},
		[setSelection],
	);
	const handleKeyboardEvent = (e: KeyboardEvent) => {
		if (Object.values<string>(keyboardArrows).includes(e.code)) handleArrowKeyboard(e.code)

		// add here switch case for other keyboard support
	}
	const handleArrowKeyboard = (key: string) => {
		const currMeasureIdx = Music.findMeasureIdx(music, selection[0].measureId)
		const part = Music.findPart(music, selection[0].partId);
		if (part) {
			const currNoteIdx = Music.findNoteIndex(part, selection[0].noteId)
			switch (key) {
				case "ArrowRight":
					KeyboardHelper.handleArrowRight(music, currMeasureIdx, part, currNoteIdx, setSelection, sizeVars.numberOfMeasuresPerRow)
					break;
				case "ArrowLeft":
					KeyboardHelper.handleArrowLeft(music, currMeasureIdx, part, currNoteIdx, setSelection, sizeVars.numberOfMeasuresPerRow)
					break;
				case "ArrowUp":
					KeyboardHelper.handleArrowUp(music, currMeasureIdx, part, currNoteIdx, setSelection, sizeVars.numberOfMeasuresPerRow)
					break;
				case "ArrowDown":
					KeyboardHelper.handleArrowDown(music, currMeasureIdx, part, currNoteIdx, setSelection, sizeVars.numberOfMeasuresPerRow)
					break;
				default:
					break;
			}
		}
	}
	return (
		<Box id="MusicUI" className={classes.root} style={{ width: `${scoreSettings.musicWidth}px` }}>
			{getRows().map((row, rIndex) => (
				<Box key={rIndex} className={classes.row} style={{ marginLeft: `${sizeVars.leftGutter}px` }}>
					{row.map((mIndex) => (
						// Add in the number of the measure if it is the first measure in a row
						<Box key={`${rIndex}-${mIndex}`} className={classes.measure} style={{ marginTop: `${rIndex === 0 ? 0 : scoreSettings.rowGap}px` }}>
							{scoreSettings.measureNumbers && music.measures[mIndex].number % sizeVars.numberOfMeasuresPerRow === 1 && (
								<Box className={classes.measureNumberAnchor}>
									<Box className={classes.measureNumber}>
										<Typography variant="body2" className={classes.measureNumberText}>
											{music.measures[mIndex].number}
										</Typography>
									</Box>
								</Box>
							)}
							{/* a part can a measure or text, several parts (instruments/singers) can be played at the measure at once*/}
							{music.measures[mIndex].parts.map((p, pIndex) => (
								<Box key={`${rIndex}-${mIndex}-${p.id}`} style={{ width: `${sizeVars.partWidth}px` }}>
									{Music.isPartVisible(music, p.partInfoId) && p.partType === PartType.FN_LVL_1 && (
										<Box className={`${classes.melodyPartRoot} ${pIndex === 0 ? '' : classes.partSpaceAbove}`}>
											{/* this is a note */}
											{p.notes.map((n) => (
												<Box
													key={n.id}
													data-note-id={n.id}
													onClick={handleClickNote}
													className={`${classes.note} ${selection.find((si) => si.noteId === n.id) ? 'selected' : ''}`}
													style={{ flex: `${n.durationDivs} 0 0`, height: `${scoreSettings.quarterSize}px`, zIndex: 100 }}
												>
													{/* the container for the note */}
													{n.fullName && (
														<Box
															className={classes.fnSymbolContainer}
															style={{
																transform: `scaleX(${n.durationDivs >= 24 ? 1 : n.durationDivs / 24})`,
															}}
														>
															{/* the note itself */}
															<Box
																className={classes.fnSymbol}
																style={{
																	...FigurenotesHelper.getSymbolStyle(
																		`${MusicalHelper.parseNote(n.fullName).step}${MusicalHelper.parseNote(n.fullName).octave}`,
																		scoreSettings.quarterSize - 2,
																		'px',
																		{ isBoomwhacker: n.isBoomwhacker, isTiedToPrev: n.isTiedToPrev },
																	),
																}}
															/>
															{/* the "tail" in case the note is longer than a standard unit, or is tied to a note in the next measure */}
															{(n.durationDivs > 24 || n.isTiedToNext || n.isTiedToPrev) && (
																<Box
																	className={classes.longNoteTail}
																	style={{
																		backgroundColor: `${FigurenotesHelper.getNoteColor(
																			MusicalHelper.parseNote(n.fullName).step,
																			n.isBoomwhacker,
																		)}`,
																		borderTop: '1.5px solid',
																		borderRight: '1.5px solid',
																		borderBottom: '1.5px solid',
																		top: `${Math.floor(scoreSettings.quarterSize / 2 - 2)}px`,
																		height: `${scoreSettings.quarterSize / 2}px`,
																		...FigurenotesHelper.parseTail(n, scoreSettings.quarterSize), // calculate specifically the 'left' and 'width' properties
																		// legacy code (unresponsive to changes to quarter size):
																		// left:
																		// 	MusicalHelper.parseNote(n.fullName).octave <= 3
																		// 		? `${scoreSettings.quarterSize - 2 - 8}px`
																		// 		: `${scoreSettings.quarterSize / 2 - 1}px`,
																		// width:
																		// 	MusicalHelper.parseNote(n.fullName).octave <= 3
																		// 		? `${((n.durationDivs - 24) * scoreSettings.quarterSize) / 24 + 7}px`
																		// 		: `${
																		// 				scoreSettings.quarterSize / 2 -
																		// 				1 +
																		// 				((n.durationDivs - 24) * scoreSettings.quarterSize) / 24
																		// 		  }px`,
																	}}
																/>
															)}
															{/* the arrow for flat / sharp */}
															{!n.isTiedToPrev && n.fullName.length >= 2 && n.fullName[1] === '#' && (
																<ArrowRightAltIcon
																	className={`${classes.alter} sharp`}
																	style={{ left: `${scoreSettings.quarterSize / 2 - 8}px` }}
																/>
															)}
															{!n.isTiedToPrev && n.fullName.length >= 2 && n.fullName[1] === 'b' && (
																<ArrowRightAltIcon
																	className={`${classes.alter} flat`}
																	style={{ left: `${scoreSettings.quarterSize / 2 - 18}px` }}
																/>
															)}
															{getPartFontSize(p.partInfoId) > 0 && (
																<Box
																	className={classes.noteName}
																	style={{
																		top: `${scoreSettings.quarterSize / 2 - 9}px`,
																		left: `${MusicalHelper.parseNote(n.fullName).alter
																			? scoreSettings.quarterSize / 2 - 9
																			: scoreSettings.quarterSize / 2 - 5.5
																			}px`,
																		fontSize: `${getPartFontSize(p.partInfoId) || 12}px`,
																	}}
																>
																	{MusicalHelper.parseNote(n.fullName).step}
																	{MusicalHelper.parseNote(n.fullName).alter}
																</Box>
															)}
														</Box>
													)}
													{/* {!n.fullName && <Box>{``}</Box>} I have no idea what this does */}
												</Box>
											))}
											{/* this are the inner borders between notes within the measure */}
											{getNotesPerMeasure(music.measures[mIndex].timeSignature).map((b, idx) => (
												<Box
													key={`${music.measures[mIndex].id}-${idx}-border-overlay`}
													className={classes.measureInnerBorders}
													style={{
														height: `${scoreSettings.quarterSize}px`,
														left: `${sizeVars.isQuarters ? scoreSettings.quarterSize * (idx + 1) - 1 : (scoreSettings.quarterSize * (idx + 1) - 1) / 2
															}px`,
													}}
												/>
											))}
										</Box>
										// <MelodyPartUI partInfo={getPartInfo(p.partInfoId)} part={p} isFirstPart={pIndex === 0} scoreSettings={scoreSettings} />
									)}
									{Music.isPartVisible(music, p.partInfoId) && p.partType === PartType.TEXT && (
										<Box className={classes.textPartRoot} style={{ backgroundColor: `${getPartInfo(p.partInfoId)?.bgColor || '#fff'}` }}>
											<TextField
												data-part-info-id={p.partInfoId}
												data-part-id={p.id}
												data-msr-id={p.measureId}
												defaultValue={p.text}
												onFocus={handleTextFocus}
												onChange={handleTextChange}
												onBlur={handleTextBlur}
												label=""
												className={`textSize-${getPartFontSize(p.partInfoId) || 12} ${getPartInfo(p.partInfoId)?.isBold ? 'font-weight-bold' : ''}`}
												style={{ borderBottom: `${pIndex === music.measures[mIndex].parts.length - 1 ? 0 : 1}px solid #eee` }}
											/>
										</Box>
									)}
								</Box>
							))}
						</Box>
					))}
				</Box>
			))
			}
		</Box >
	);
};
