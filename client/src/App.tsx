import React, { ReactElement, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import { createMyTheme } from './services/themeHelper';
import './App.css';
import { AppDataHelper } from './services/appDataHelper';
import { MainPage } from './views/main/MainPage';

function App(): ReactElement {
	const [theme] = useState(createMyTheme());

	useEffect(function setDocumentTitle() {
		document.title = AppDataHelper.appName;
	}, []);

	return (
		<>
			<CssBaseline />
			<ThemeProvider theme={theme}>
				<RecoilRoot>
					<BrowserRouter>
						<MainPage />
					</BrowserRouter>
				</RecoilRoot>
			</ThemeProvider>
		</>
	);
}

export default App;
