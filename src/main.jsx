import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import App from './App';
import './index.css';
import { handleKeycloakAuth } from './services/keycloakAuthHandler';

// Initialize Keycloak before rendering the app
const renderApp = async () => {
  // Try to authenticate with Keycloak
  await handleKeycloakAuth(store);
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </React.StrictMode>
  );
};

renderApp();
