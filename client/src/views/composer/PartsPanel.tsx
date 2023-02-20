import React, { useCallback, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { IconButton, Slider, Typography } from '@material-ui/core';
import ArrowDropUpOutlinedIcon from '@material-ui/icons/ArrowDropUpOutlined';
import ArrowDropDownOutlinedIcon from '@material-ui/icons/ArrowDropDownOutlined';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { DraggedItemType } from '../../atoms/draggedItemAtom';
import { DraggablePanel } from '../../components/DraggablePanel';
import { PartType } from '../../model/scoreModel';
import { Music } from '../../model/music';
import { selectionAtom } from '../../atoms/selectionAtom';
import {
	red,
	pink,
	purple,
	deepPurple,
	indigo,
	blue,
	lightBlue,
	cyan,
	teal,
	green,
	lightGreen,
	lime,
	yellow,
	amber,
	orange,
	deepOrange,
	// brown,
	// grey,
	// blueGrey,
} from '@material-ui/core/colors';
import { AnalyticsHelper, EventCategory } from '../../services/analyticsHelper';

export interface PartsPanelProps {
	music: Music;
	onUpdateScore: () => void;
}

export const PartsPanel = ({ music, onUpdateScore }: PartsPanelProps) => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'absolute',
			width: 493,
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
			gridTemplate: 'auto auto / 1fr',
			gap: '1px 0',
			backgroundColor: '#444',
			padding: 8,
		},
		contentCollapsed: {
			height: 0,
			padding: 0,
			overflow: 'hidden',
		},
		partRow: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			height: 26,
			backgroundColor: '#333',
			padding: '0 4px',
		},
		partRowLeftSection: {
			display: 'flex',
			alignItems: 'center',
		},
		partRowRightSection: {
			display: 'flex',
			alignItems: 'center',
		},
		partName: {
			marginLeft: 4,
			color: '#aaa',
			transition: 'all 0.2s ease-in-out',
			'&.selected': {
				color: '#fa3',
			},
			'&.disabled': {
				color: '#666',
				pointerEvents: 'none',
			},
		},
		actionButton: {
			width: 24,
			height: 24,
			marginRight: 8,
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
		smallActionButton: {
			'&:first-of-type': {
				marginRight: 0,
			},
		},
		textButton: {
			marginLeft: 2,
			transition: 'all 0.2s ease-in-out',
			cursor: 'pointer',
			color: '#999',
			'&:hover': {
				color: '#fff',
			},
		},
		noteNameButton: {
			margin: '0 10px 0 0',
			width: 24,
			borderRadius: 4,
			textAlign: 'center',
			color: '#ccc',
		},
		noteNameButtonActive: {
			backgroundColor: '#666',
		},
		boldButton: {
			margin: '0 10px 0 0',
			width: 24,
			borderRadius: 4,
			textAlign: 'center',
			color: '#ccc',
			fontWeight: 900,
		},
		boldButtonActive: {
			backgroundColor: '#666',
		},
		slider: {
			position: 'relative',
			top: 2,
			width: 136,
			marginLeft: 12,
			'& .MuiSlider-rail': {
				color: '#ccc',
			},
			'& .MuiSlider-root': {
				color: '#fff',
			},
			'& .MuiSlider-thumb': {
				boxShadow: 'none',
			},
			'& .MuiSlider-markLabel': {
				color: '#aaa',
			},
			'& .MuiSlider-markLabelActive': {
				color: '#fff',
			},
			'& .MuiSlider-root.Mui-disabled': {
				opacity: 0.5,
				'& .MuiSlider-thumb': {
					color: '#aaa',
				},
				'& .MuiSlider-markLabelActive': {
					color: '#aaa',
				},
			},
		},
		bgColor: {
			marginLeft: 12,
			width: 16,
			height: 16,
			borderRadius: 2,
			cursor: 'pointer',
		},
	}));
	const classes = useStyles();

	const selection = useRecoilValue(selectionAtom);
	const draggablePanelContentRef = useRef(null);

	const [isExpanded, setIsExpanded] = useState(true);
	const handleClickExpand = useCallback(function handleClickExpand() {
		setIsExpanded(true);
	}, []);
	const handleClickCollapse = useCallback(function handleClickCollapse() {
		setIsExpanded(false);
	}, []);

	const handleClickUpOrDown = useCallback(
		function handleClickUpOrDown(e) {
			const partInfoId = e.currentTarget.dataset.partInfoId;
			const pi = music.partsInfo.find((pi) => pi.id === partInfoId);
			if (!pi) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.PARTS, 'reorder part');
			const isUp = e.currentTarget.dataset.direction === 'up';
			Music.movePart(music, partInfoId, isUp);
			onUpdateScore();
		},
		[music, onUpdateScore],
	);

	const handleClickToggleNoteName = useCallback(
		function handleClickToggleNoteName(e) {
			const pi = music.partsInfo.find((pi) => pi.id === e.currentTarget.dataset.partInfoId);
			if (!pi) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.PARTS, pi.fontSize === 0 ? 'show note names' : 'hide note names');
			pi.fontSize = pi.fontSize === 0 ? 12 : 0;
			onUpdateScore();
		},
		[music.partsInfo, onUpdateScore],
	);

	const handleClickToggleBold = useCallback(
		function handleClickToggleBold(e) {
			const pi = music.partsInfo.find((pi) => pi.id === e.currentTarget.dataset.partInfoId);
			if (!pi) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.PARTS, pi.isBold ? 'use regular text' : 'use bold text');
			pi.isBold = !pi.isBold;
			onUpdateScore();
		},
		[music.partsInfo, onUpdateScore],
	);

	const handleClickShowOrHide = useCallback(
		function handleClickShowOrHide(e) {
			const pi = music.partsInfo.find((pi) => pi.id === e.currentTarget.dataset.partInfoId);
			if (!pi) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.PARTS, pi.isVisible ? 'hide part' : 'show part');
			pi.isVisible = !pi.isVisible;
			onUpdateScore();
		},
		[music.partsInfo, onUpdateScore],
	);

	const handleChangeFontSize = useCallback(
		function handleChangeFontSize(e, value) {
			const partInfoId = e.target.dataset.partInfoId || e.target.parentElement.dataset.partInfoId;
			const pi = music.partsInfo.find((pi) => pi.id === partInfoId);
			if (!pi || pi.fontSize === value) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.PARTS, 'change part text size', value);
			pi.fontSize = value;
			onUpdateScore();
		},
		[music.partsInfo, onUpdateScore],
	);

	const handleClickBgColor = useCallback(
		function handleClickBgColor(e) {
			const pi = music.partsInfo.find((pi) => pi.id === e.currentTarget.dataset.partInfoId);
			if (!pi) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.PARTS, 'change part background color');
			const bgColors = [
				'#f6f6f6',
				'#fff',
				red[50],
				pink[50],
				purple[50],
				deepPurple[50],
				indigo[50],
				blue[50],
				lightBlue[50],
				cyan[50],
				teal[50],
				green[50],
				lightGreen[50],
				lime[50],
				yellow[50],
				amber[50],
				orange[50],
				deepOrange[50],
				//brown[50],
				//blueGrey[50],
			];
			const curIndex = bgColors.findIndex((c) => c === pi.bgColor);
			if (curIndex === -1) {
				pi.bgColor = bgColors[Math.trunc(Math.random() * bgColors.length)];
			} else {
				pi.bgColor = bgColors[(curIndex + 1) % bgColors.length];
			}
			onUpdateScore();
		},
		[music, onUpdateScore],
	);

	const handleClickDeletePart = useCallback(
		function handleClickDeletePart(e) {
			const pi = music.partsInfo.find((pi) => pi.id === e.currentTarget.dataset.partInfoId);
			if (!pi) {
				return;
			}
			AnalyticsHelper.sendEvent(EventCategory.PARTS, 'delete part');
			Music.deletePart(music, pi.id);
			onUpdateScore();
		},
		[music, onUpdateScore],
	);

	const handleClickAddMelodyPart = useCallback(
		function handleClickAddMelodyPart() {
			AnalyticsHelper.sendEvent(EventCategory.PARTS, 'add melody part');
			Music.addPart(music, PartType.FN_LVL_1, 'Melody', true);
			onUpdateScore();
		},
		[music, onUpdateScore],
	);

	const handleClickAddTextPart = useCallback(
		function handleClickAddTextPart() {
			AnalyticsHelper.sendEvent(EventCategory.PARTS, 'add text part');
			Music.addPart(music, PartType.TEXT, 'Text', true);
			onUpdateScore();
		},
		[music, onUpdateScore],
	);

	return (
		<div id="PartsPanel" ref={draggablePanelContentRef} className={`${classes.root} ${isExpanded ? '' : classes.rootCollapsed}`}>
			<DraggablePanel title="Parts" contentRef={draggablePanelContentRef} draggedItemType={DraggedItemType.PARTS_PANEL} />
			{!isExpanded && <ExpandMoreIcon onClick={handleClickExpand} className={classes.expandCollapseButton} />}
			{isExpanded && <ExpandLessIcon onClick={handleClickCollapse} className={classes.expandCollapseButton} />}
			<Box className={`${classes.content} ${isExpanded ? '' : classes.contentCollapsed}`}>
				{music.partsInfo.map((pi, piIndex) => (
					<Box key={pi.id} className={classes.partRow}>
						<Box className={classes.partRowLeftSection}>
							<IconButton
								onClick={handleClickUpOrDown}
								disabled={piIndex === 0}
								data-part-info-id={pi.id}
								data-direction="up"
								className={`${classes.actionButton} ${classes.smallActionButton}`}
							>
								<ArrowDropUpOutlinedIcon titleAccess="Move part up" />
							</IconButton>
							<IconButton
								onClick={handleClickUpOrDown}
								disabled={piIndex === music.partsInfo.length - 1}
								data-part-info-id={pi.id}
								data-direction="down"
								className={`${classes.actionButton} ${classes.smallActionButton}`}
							>
								<ArrowDropDownOutlinedIcon titleAccess="Move part down" />
							</IconButton>
							{pi.partType === PartType.FN_LVL_1 && (
								<Typography
									variant="body1"
									title={pi.fontSize > 0 ? 'Hide note name' : 'Show note name'}
									onClick={handleClickToggleNoteName}
									data-part-info-id={pi.id}
									className={`${classes.textButton} ${classes.noteNameButton} ${pi.fontSize > 0 ? classes.noteNameButtonActive : ''}`}
								>
									N
								</Typography>
							)}
							{pi.partType === PartType.TEXT && (
								<Typography
									variant="body1"
									title={pi.isBold ? 'Use regular font' : 'Use bold font'}
									onClick={handleClickToggleBold}
									data-part-info-id={pi.id}
									className={`${classes.textButton} ${classes.boldButton} ${pi.isBold ? classes.boldButtonActive : ''}`}
								>
									B
								</Typography>
							)}
							{pi.isVisible && (
								<IconButton onClick={handleClickShowOrHide} data-part-info-id={pi.id} className={classes.actionButton}>
									<VisibilityIcon titleAccess="Hide part" />
								</IconButton>
							)}
							{!pi.isVisible && (
								<IconButton onClick={handleClickShowOrHide} data-part-info-id={pi.id} className={classes.actionButton}>
									<VisibilityOffIcon titleAccess="Show part" />
								</IconButton>
							)}
							<Typography
								variant="body1"
								className={`${classes.partName} ${selection.length === 1 && selection[0].partInfoId === pi.id ? 'selected' : ''} ${pi.isVisible ? '' : 'disabled'}`}
							>
								{pi.name}
							</Typography>
							{pi.partType === PartType.TEXT && (
								<Box className={classes.slider}>
									<Slider
										data-part-info-id={pi.id}
										onChange={handleChangeFontSize}
										min={8}
										max={24}
										step={1}
										value={pi.fontSize}
										marks={false}
										track={false}
										valueLabelDisplay="off"
									/>
								</Box>
							)}
							{pi.partType === PartType.TEXT && (
								<Box onClick={handleClickBgColor} data-part-info-id={pi.id} className={classes.bgColor} style={{ backgroundColor: pi.bgColor }} />
							)}
						</Box>
						<Box className={classes.partRowRightSection}>
							<IconButton onClick={handleClickDeletePart} data-part-info-id={pi.id} className={classes.actionButton} style={{ marginRight: '0' }}>
								<DeleteForeverIcon titleAccess="Delete part" />
							</IconButton>
						</Box>
					</Box>
				))}
				<Box className={classes.partRow}>
					<Box className={classes.partRowLeftSection}>
						<IconButton onClick={handleClickAddMelodyPart} className={classes.actionButton} style={{ marginRight: '0' }}>
							<AddCircleOutlineIcon titleAccess="Add melody part" />
						</IconButton>
						<Typography onClick={handleClickAddMelodyPart} variant="body1" className={classes.textButton}>
							Melody
						</Typography>
						<IconButton onClick={handleClickAddTextPart} className={classes.actionButton} style={{ marginLeft: '16px', marginRight: '0' }}>
							<AddCircleOutlineIcon titleAccess="Add text part" />
						</IconButton>
						<Typography onClick={handleClickAddTextPart} variant="body1" className={classes.textButton}>
							Text
						</Typography>
					</Box>
				</Box>
			</Box>
		</div>
	);
};
