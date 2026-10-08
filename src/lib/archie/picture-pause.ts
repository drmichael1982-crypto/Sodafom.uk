import {createContext,useContext} from 'react';
export const PicturePauseContext=createContext(false);
export const usePicturePuzzlePause=()=>useContext(PicturePauseContext);
