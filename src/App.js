import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './config/ReactotronConfig';

import history from './services/history';
import store from './store';
import GlobalStyle from './styles/globais';
import Header from './components/Header';

import Routes from './routes';

function App() {
  return (
    <Provider store={store}>
      <Router history={history}>
        <Header />
        <Routes />
        <ToastContainer autoClose={3000} />
        <GlobalStyle />
      </Router>
    </Provider>
  );
}

export default App;
