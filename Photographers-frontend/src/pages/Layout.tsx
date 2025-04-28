// not used?
import PhotographerDialog from './PhotographerDialog';
 
 interface LayoutProps {
     children: React.ReactNode;
 }
 const Layout = ({children}: LayoutProps) => {
     return (
         <>
             <PhotographerDialog />
             {children}
         </>
     );
 };
 
 export default Layout;