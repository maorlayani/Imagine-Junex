import React, { useEffect, useRef } from 'react';
import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';

interface VideoLoopProps {
	videoName: string;
	playbackSpeed?: number;
	blurPixels?: number;
	grayscale?: boolean;
	top?: string;
	height?: string;
}

export const VideoLoop = React.memo(({ videoName, playbackSpeed = 1, blurPixels = 0, grayscale = false, top = '0', height = '100vh' }: VideoLoopProps) => {
	const useStyles = makeStyles((/*theme*/) => ({
		root: {
			position: 'absolute',
			left: 0,
			top: 0,
			minWidth: '100vw',
			overflow: 'hidden',
			pointerEvents: 'none',
			'@media print': {
				display: 'none',
			},
		},
		video: {
			position: 'absolute',
			width: '177.77777778vh' /* 100 * 16 / 9 */,
			minWidth: '100vw',
			height: '100vh',
			minHeight: '56.25vw' /* 100 * 9 / 16 */,
		},
		grayscale: {
			filter: 'grayscale(1)',
		},
	}));
	const classes = useStyles();

	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(
		function initVideoLoop() {
			if (videoRef && videoRef.current) {
				if (playbackSpeed < 1) {
					videoRef.current.playbackRate = playbackSpeed;
				}
				if (blurPixels > 0) {
					videoRef.current.style.filter = `blur(${blurPixels}px`;
				}
			}
		},
		[playbackSpeed, blurPixels],
	);

	return (
		<Box id="VideoLoop" className={`${classes.root} ${grayscale ? classes.grayscale : ''}`} style={{ top: top, minHeight: height }}>
			<video ref={videoRef} autoPlay={true} loop={true} muted={true} playsInline={true} className={`${classes.video} ${grayscale ? classes.grayscale : ''}`}>
				<source type="video/mp4" src={`/vid/${videoName}.mp4`} />
			</video>
		</Box>
	);
});
