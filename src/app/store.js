import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import coursesReducer from '../features/coursesSlice';
import quizReducer from '../features/quizSlice';
import uiReducer from '../features/uiSlice';
import instructorReducer from '../features/instructorSlice';
import studentReducer from '../features/studentSlice';
import sectionReducer from '../features/sectionSlice';
import categoryReducer from '../features/categorySlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        courses: coursesReducer,
        quiz: quizReducer,
        ui: uiReducer,
        instructor: instructorReducer,
        student: studentReducer,
        section: sectionReducer,
        category: categoryReducer,
    },
});

export default store;
