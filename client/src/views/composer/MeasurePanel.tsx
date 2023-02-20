import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { IconButton, Typography } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
// import AddToPhotosIcon from '@material-ui/icons/AddToPhotos';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import AssignmentIcon from '@material-ui/icons/Assignment';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { MeasureModel, PartType, ScoreModel } from '../../model/scoreModel';
import { Measure } from '../../model/measure';
import { Music } from '../../model/music';
import { Score } from '../../model/score';
import { selectionAtom } from '../../atoms/selectionAtom';
import { copiedMeasureIdAtom } from '../../atoms/copiedMeasureIdAtom';
import { DraggedItemType } from '../../atoms/draggedItemAtom';
import { DraggablePanel } from '../../components/DraggablePanel';
import { AnalyticsHelper, EventCategory } from '../../services/analyticsHelper';

export interface MeasurePanelProps {
	score: ScoreModel;
	onUpdateScore: () => void;
}

export const MeasurePanel = ({ score, onUpdateScore }: MeasurePanelProps) => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'absolute',
			width: 239,
			backgroundColor: '#222',
			borderRadius: 4,
			padding: 4,
			userSelect: 'none',
		},
		rootCollapsed: {
			width: 160,
			paddingBottom: 0,
		},
		expandCollapseButton: {
			position: 'absolute',
			top: 3,
			right: 6,
			cursor: 'pointer',
			color: '#ccc',
		},
		content: {
			display: 'grid',
			gridTemplate: 'auto / 1fr',
			gap: '12px 0',
			backgroundColor: '#444',
			padding: 8,
		},
		contentCollapsed: {
			height: 0,
			padding: 0,
			overflow: 'hidden',
		},
		panel: {
			display: 'inline-flex',
			alignItems: 'center',
			height: 32,
			borderRadius: 16,
			backgroundColor: '#333',
			padding: '0 6px 0 4px',
		},
		panelButtonOnly: {
			padding: '0 4px',
		},
		buttonsRow: {
			display: 'flex',
			justifyContent: 'space-between',
		},
		actionButton: {
			width: 24,
			height: 24,
			textAlign: 'center',
			cursor: 'pointer',
			transition: 'all 0.2s ease-in-out',
			color: '#ccc',
			'&:hover': {
				color: '#fff',
			},
			'&.disabled': {
				pointerEvents: 'none',
				color: '#666',
			},
		},
		toggleSharpsButton: {
			width: 20,
			color: '#ccc',
			'&:hover': {
				color: '#fff',
			},
			cursor: 'pointer',
		},
	}));
	const classes = useStyles();

	const selection = useRecoilValue(selectionAtom);
	const resetSelection = useResetRecoilState(selectionAtom);
	const [copiedMeasureId, setCopiedMeasureId] = useRecoilState(copiedMeasureIdAtom);
	const [canAdd, setCanAdd] = useState(false);
	// const [canDuplicate, setCanDuplicate] = useState(false);
	const [canCopy, setCanCopy] = useState(false);
	const [canPaste, setCanPaste] = useState(false);
	const [canDelete, setCanDelete] = useState(false);
	const [canUseFlats, setCanUseFlats] = useState(false);
	const [canUseSharps, setCanUseSharps] = useState(false);
	const draggablePanelContentRef = useRef(null);

	const [isExpanded, setIsExpanded] = useState(true);
	const handleClickExpand = useCallback(function handleClickExpand() {
		setIsExpanded(true);
	}, []);
	const handleClickCollapse = useCallback(function handleClickCollapse() {
		setIsExpanded(false);
	}, []);

	const getSelectedMeasures = useCallback(
		function getSelectedMeasures() {
			if (!score || !selection) {
				return [];
			}
			const measures: MeasureModel[] = [];
			selection.forEach((item) => {
				const m = Score.findMeasure(score, item.measureId);
				if (m) {
					measures.push(m);
				}
			});
			return measures;
		},
		[score, selection],
	);

	useEffect(
		function enableMeasurePanelActions() {
			setCanAdd(false);
			// setCanDuplicate(false);
			setCanCopy(false);
			setCanPaste(false);
			setCanUseFlats(false);
			setCanUseSharps(false);
			setCanDelete(false);
			if (score && selection && selection.length === 1 && selection[0].measureId && selection[0].partId) {
				const m = Score.findMeasure(score, selection[0].measureId);
				if (!m) {
					return;
				}
				const p = Score.findPart(score, selection[0].partId);
				setCanAdd(!!(p && (p.partType === PartType.FN_LVL_1 || p.partType === PartType.TEXT)));
				// setCanDuplicate(!!(p && p.partType === PartType.FN_LVL_1 && !m.isPickup));
				setCanCopy(!!(p && (p.partType === PartType.FN_LVL_1 || p.partType === PartType.TEXT)));
				setCanPaste(!!(p && (p.partType === PartType.FN_LVL_1 || p.partType === PartType.TEXT) && copiedMeasureId && copiedMeasureId !== m.id));
				setCanUseFlats(!!(p && p.partType === PartType.FN_LVL_1 && m.useSharps));
				setCanUseSharps(!!(p && p.partType === PartType.FN_LVL_1 && !m.useSharps));
				setCanDelete(!!(p && (p.partType === PartType.FN_LVL_1 || p.partType === PartType.TEXT) && !m.isPickup && score.music.measures.length > 1));
			}
		},
		[score, selection, copiedMeasureId],
	);

	const handleClickAdd = useCallback(
		function handleClickAdd() {
			const measures: MeasureModel[] = getSelectedMeasures();
			if (!score || measures.length !== 1) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.MEASURE, 'add empty measure');
			Music.addMeasure(score.music, measures[0].id);
			onUpdateScore();
		},
		[score, getSelectedMeasures, onUpdateScore],
	);

	// const handleClickDuplicate = useCallback(
	// 	function handleClickDuplicate() {
	// 		const measures: MeasureModel[] = getSelectedMeasures();
	// 		if (!score || measures.length !== 1) {
	// 			return;
	// 		}
	// 		Music.duplicateMeasure(score.music, measures[0].id);
	// 		onUpdateScore();
	// 	},
	// 	[score, getSelectedMeasures, onUpdateScore],
	// );

	const handleClickCopy = useCallback(
		function handleClickCopy() {
			const measures: MeasureModel[] = getSelectedMeasures();
			if (!score || measures.length !== 1) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.MEASURE, 'copy measure');
			setCopiedMeasureId(measures[0].id);
			onUpdateScore();
		},
		[score, getSelectedMeasures, setCopiedMeasureId, onUpdateScore],
	);

	const handleClickPaste = useCallback(
		function handleClickPaste() {
			const measures: MeasureModel[] = getSelectedMeasures();
			if (!score || measures.length !== 1 || !copiedMeasureId) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.MEASURE, 'paste measure');
			Music.pasteMeasure(score.music, copiedMeasureId, measures[0].id);
			onUpdateScore();
		},
		[score, getSelectedMeasures, copiedMeasureId, onUpdateScore],
	);

	const handleClickToggleSharps = useCallback(
		function handleClickToggleSharps() {
			const measures: MeasureModel[] = getSelectedMeasures();
			if (!score || measures.length !== 1) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.MEASURE, 'toggle sharps');
			Measure.toggleSharps(measures[0]);
			onUpdateScore();
		},
		[score, getSelectedMeasures, onUpdateScore],
	);

	const handleClickDelete = useCallback(
		function handleClickDelete() {
			const measures: MeasureModel[] = getSelectedMeasures();
			if (!score || measures.length !== 1) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.MEASURE, 'delete measure');
			Music.deleteMeasure(score.music, measures[0].id);
			resetSelection();
			onUpdateScore();
		},
		[score, getSelectedMeasures, resetSelection, onUpdateScore],
	);

	return (
		<div id="MeasurePanel" ref={draggablePanelContentRef} className={`${classes.root} ${isExpanded ? '' : classes.rootCollapsed}`}>
			<DraggablePanel title="Measure" contentRef={draggablePanelContentRef} draggedItemType={DraggedItemType.MEASURE_PANEL} />
			{!isExpanded && <ExpandMoreIcon onClick={handleClickExpand} className={classes.expandCollapseButton} />}
			{isExpanded && <ExpandLessIcon onClick={handleClickCollapse} className={classes.expandCollapseButton} />}
			<Box className={`${classes.content} ${isExpanded ? '' : classes.contentCollapsed}`}>
				<Box className={classes.buttonsRow}>
					<Box className={classes.panel}>
						<IconButton onClick={handleClickAdd} disabled={!canAdd} className={classes.actionButton}>
							<AddCircleOutlineIcon titleAccess="Add empty measure" />
						</IconButton>
						{/*<IconButton onClick={handleClickDuplicate} disabled={!canDuplicate} className={classes.actionButton} style={{ marginLeft: '12px' }}>*/}
						{/*	<AddToPhotosIcon titleAccess="Duplicate measure" />*/}
						{/*</IconButton>*/}
						<IconButton onClick={handleClickCopy} disabled={!canCopy} className={classes.actionButton} style={{ marginLeft: '12px' }}>
							<FileCopyIcon titleAccess="Copy measure" />
						</IconButton>
						<IconButton onClick={handleClickPaste} disabled={!canPaste} className={classes.actionButton} style={{ marginLeft: '12px' }}>
							<AssignmentIcon titleAccess="Paste measure" />
						</IconButton>
					</Box>
					<Box className={classes.panel} style={{ visibility: canUseSharps || canUseFlats ? 'visible' : 'hidden' }}>
						<Typography variant="body1" title="Toggle flats/sharps" onClick={handleClickToggleSharps} className={classes.toggleSharpsButton}>
							b/#
						</Typography>
					</Box>
					<Box className={`${classes.panel} ${classes.panelButtonOnly}`}>
						<IconButton onClick={handleClickDelete} disabled={!canDelete} className={classes.actionButton}>
							<DeleteForeverIcon titleAccess="Delete measure" />
						</IconButton>
					</Box>
				</Box>
			</Box>
		</div>
	);
};
