import { createSlice } from '@reduxjs/toolkit';

const initialState = ''; // Ensure initial state is defined

const MenusSlice = createSlice({
  name: 'MenusSlice',
  initialState,
  reducers: {
    setMenus: (state, action) => action.payload,
    clearMenus: () => initialState // Reset state when clearing
  },
});

// Export actions
export const { setMenus, clearMenus } = MenusSlice.actions;

// Export reducer
export const MenusReducer = MenusSlice.reducer;


