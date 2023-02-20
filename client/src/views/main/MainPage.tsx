import React from 'react';
import { Route, Switch } from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box/Box';
import { VideoLoop } from './VideoLoop';
import { Masthead } from './Masthead';
import { HomePage } from '../home/HomePage';
import { ComposerPage } from '../composer/ComposerPage';
import { PlayPage } from '../play/PlayPage';
import { HelpPage } from '../help/HelpPage';
import { AboutPage } from '../about/AboutPage';
import { Footer } from './Footer';

export const MainPage = React.memo(() => {
	const useStyles = makeStyles((theme) => ({
		root: {
			position: 'absolute',
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			overflow: 'hidden',
			color: theme.palette.text.primary,
			fontFamily: theme.typography.fontFamily,
			opacity: 0,
			animation: 'fade-in-animation 1s 1s ease-in-out forwards',
			backgroundColor: '#222',
			'@media print': {
				overflow: 'visible',
				backgroundColor: '#fff',
			},
		},
		topCover: {
			position: 'absolute',
			left: 0,
			right: 0,
			top: 0,
			height: 100,
			backgroundColor: '#666',
			//backgroundImage: 'linear-gradient(135deg, #c90 25%, #a60 25%, #a60 50%, #c90 50%, #c90 75%, #a60 75%, #a60 100%)',
			//backgroundImage: 'linear-gradient(135deg, #999 25%, #666 25%, #666 50%, #999 50%, #999 75%, #666 75%, #666 100%)',
			//backgroundSize: '8px 8px',
			opacity: 0.25,
			borderBottom: '1px solid #000',
			'@media print': {
				display: 'none',
			},
		},
		bottomBackground: {
			position: 'absolute',
			left: 0,
			right: 0,
			top: 90,
			height: 'calc(100% - 90px)',
			backgroundColor: '#ccc',
			backgroundImage: 'url("/img/music-sheet.jpg")',
			backgroundSize: 'cover',
			filter: 'grayscale(1) blur(5px)',
			'@media print': {
				display: 'none',
			},
		},
		bottomCover: {
			position: 'absolute',
			left: 0,
			right: 0,
			top: 90,
			height: 'calc(100% - 90px)',
			backgroundColor: '#000',
			opacity: 0.25,
			'@media print': {
				display: 'none',
			},
		},
		content: {
			position: 'absolute',
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			color: theme.palette.text.primary,
		},
		mastheadContainer: {
			position: 'relative',
			height: 100,
			//maxWidth: 1280,
			marginLeft: 'auto',
			marginRight: 'auto',
			padding: '0 32px',
			'@media print': {
				display: 'none',
			},
		},
		pageContainer: {
			height: 'calc(100% - 100px)',
			//maxWidth: 1280,
			marginLeft: 'auto',
			marginRight: 'auto',
			color: theme.palette.text.primary,
			padding: 32,
			'@media print': {
				padding: 0,
			},
		},
	}));
	const classes = useStyles();

	return (
		<Box id="MainPage" className={classes.root}>
			<Box className={classes.bottomBackground} />
			<Box className={classes.bottomCover} />
			{/*{<VideoLoop videoName="purple-bokeh" height="100px" playbackSpeed={1} blurPixels={0} grayscale={false} />}*/}
			{<VideoLoop videoName="purple-bokeh" height="100px" playbackSpeed={1} blurPixels={0} grayscale={true} />}
			<Box className={classes.topCover} />
			<Box className={classes.content}>
				<Box className={classes.mastheadContainer}>
					<Masthead />
				</Box>
				<Box className={classes.pageContainer}>
					<Switch>
						<Route path="/home" exact component={HomePage} />
						<Route path="/composer" exact component={ComposerPage} />
						<Route path="/play" exact component={PlayPage} />
						<Route path="/help" exact component={HelpPage} />
						<Route path="/about" exact component={AboutPage} />
						<Route component={HomePage} />
					</Switch>
				</Box>
			</Box>
			<Footer />
		</Box>
	);
});
