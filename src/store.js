import { configureStore } from '@reduxjs/toolkit';

import { MenusReducer }  from './Commoncomponents/ReduxSlice';

const store = configureStore({
  reducer: {
    menus: MenusReducer
  },
});

export default store;
