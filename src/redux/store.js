import { combineReducers, createStore } from "redux";
import { CollapsedReducer } from "./CollapsedReducer";
import { LoadingReducer } from "./LoadingReducer";
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

const persistConfig = {
    key: 'root',
    storage,
    blacklist: ['LoadingReducer']
}

const reducer = combineReducers({
    CollapsedReducer,
    LoadingReducer,
})

const persistedReducer = persistReducer(persistConfig, reducer)


const store = createStore(persistedReducer)
const persistor = persistStore(store)

export { store, persistor }