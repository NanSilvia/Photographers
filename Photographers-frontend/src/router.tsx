import {Suspense, lazy} from 'react';
 import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
 
 const AppRouter = () => {
     const Overview = lazy(() => import('./pages/Overview'));
     const DetailPage = lazy(() => import('./pages/Detail'));
     return (
         <BrowserRouter>
             <Suspense fallback={<></>}>
                 <Routes>
                     <Route
                         path='/'
                         element={<Navigate replace to='/photographers' />}
                     />
                     <Route element={<Overview />} path={'/photographers'} />
                     <Route element={<DetailPage />} path={'/photographers/:id'} />
                 </Routes>
             </Suspense>
         </BrowserRouter>
     );
 };
 
 export default AppRouter;