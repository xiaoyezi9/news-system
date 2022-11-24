// @ts-nocheck
import { Provider } from 'react-redux';
import './App.css';
import { store, persistor } from "./redux/store";
import { PersistGate } from 'redux-persist/integration/react'
import IndexRouter from './router/IndexRouter'
function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
       <IndexRouter></IndexRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
