// import { useState, useEffect } from 'react';
// import AddIcon from '@mui/icons-material/Add';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';
// import FilterListIcon from '@mui/icons-material/FilterList';
// import { Card, CardActionArea, CardActions, CardContent, CardMedia, Grid, IconButton, Typography, Box, Button } from '@mui/material';
// import { useNavigate } from 'react-router-dom';

// import usePhotographerStore from '../stores/PhotographerStore';
// import '../styles/CardStyles.css';
// import Photographer from '../model/Photographer';
// import ConfirmationDialog from './ModalPopup';
// import PhotographerForm from './PhotographerForm';

// function Overview() {
//     const navigate = useNavigate();
//     const { photographers, deletePhotographer, addPhotographer, editPhotographer, handleOpen, handleClose, selectedPhotographer } = usePhotographerStore();
//     const [isFormOpen, setIsFormOpen] = useState(false);
//     const [filterAlive, setFilterAlive] = useState(false); // State for filtering alive photographers
//     const [currentPage, setCurrentPage] = useState(1); // State for current page
//     const photographersPerPage = 8; // Number of photographers per page

//     // Calculate oldest and youngest photographers
//     const oldestPhotographer = photographers.reduce((oldest, p) => 
//         (!oldest || p.birth < oldest.birth) ? p : oldest, null as Photographer | null
//     );

//     const youngestPhotographer = photographers.reduce((youngest, p) => 
//         (!youngest || p.birth > youngest.birth) ? p : youngest, null as Photographer | null
//     );

//     // Filter photographers based on the filterAlive state
//     const filteredPhotographers = filterAlive
//         ? photographers.filter((p) => p.death === null)
//         : photographers;

//     // Pagination logic
//     const indexOfLastPhotographer = currentPage * photographersPerPage;
//     const indexOfFirstPhotographer = indexOfLastPhotographer - photographersPerPage;
//     const currentPhotographers = filteredPhotographers.slice(indexOfFirstPhotographer, indexOfLastPhotographer);

//     // Total number of pages
//     const totalPages = Math.ceil(filteredPhotographers.length / photographersPerPage);

//     // Handle page change
//     const handlePageChange = (newPage: number) => {
//         setCurrentPage(newPage);
//     };

//     const handleConfirmation = (p: Photographer) => {
//         deletePhotographer(p.id);
//         console.log('Confirmed!');
//     };

//     const handleAddPhotographer = (data: Omit<Photographer, 'id'>) => {
//         const newPhotographer = {
//             id: Math.floor(Math.random() * 1000), // Generate a random ID
//             ...data,
//         };
//         addPhotographer(newPhotographer);
//     };

//     const handleEditPhotographer = (data: Omit<Photographer, 'id'>) => {
//         if (selectedPhotographer) {
//             const updatedPhotographer = {
//                 ...selectedPhotographer,
//                 ...data,
//             };
//             editPhotographer(updatedPhotographer);
//         }
//     };

//     // Open the form when a photographer is selected for editing
//     useEffect(() => {
//         if (selectedPhotographer) {
//             setIsFormOpen(true); // Open the form when a photographer is selected
//         }
//     }, [selectedPhotographer]);

//     return (
//         <>
//             <Grid container spacing={2}>
//                 <Grid item xs={12} alignItems={'center'}>
//                     <Typography align='center' variant='h4'>
//                         Photographer Overview
//                     </Typography>
//                 </Grid>
//                 <Grid item xs={12} display={'flex'} justifyContent={'flex-end'}>
//                     <Box display="flex" alignItems="center">
//                         <IconButton onClick={() => setFilterAlive(!filterAlive)} aria-label='filter'>
//                             <FilterListIcon sx={{ color: filterAlive ? 'primary.main' : 'black' }} />
//                         </IconButton>
//                     </Box>
//                     <IconButton onClick={() => { handleOpen(); setIsFormOpen(true); }} aria-label='add'>
//                         <AddIcon sx={{ color: 'black' }} />
//                     </IconButton>
//                 </Grid>
//                 {currentPhotographers.map((p: Photographer) => {
//                     const isOldest = p.id === oldestPhotographer?.id;
//                     const isYoungest = p.id === youngestPhotographer?.id;

//                     return (
//                         <Grid key={p.id} item xs={12} md={3} display={'flex'} justifyContent={'center'}>
//                             <Card sx={{ 
//                                 maxWidth: 345, 
//                                 width: 345, 
//                                 border: isOldest ? '2px solid red' : isYoungest ? '2px solid green' : 'none' 
//                             }} className='portCardCl'>
//                                 <CardActionArea
//                                     onClick={() => navigate(`/photographers/${p.id}`)} className='portBodyCl'>
//                                     <CardMedia
//                                         sx={{
//                                             height: 300,
//                                             width: 345,
//                                             objectFit: 'cover',
//                                         }}
//                                         image={p.profilepicUrl}
//                                         title={p.name}
//                                     />
//                                     <CardContent sx={{ height: 'auto' }}>
//                                         <Typography
//                                             gutterBottom
//                                             variant='h5'
//                                             fontStyle={'oblique'}
//                                             component='div'
//                                         >{`${p.name}`}</Typography>
//                                         <Typography
//                                             gutterBottom
//                                             variant='body1'
//                                             component='div'
//                                         >
//                                             {`Born: ${p.birth.toDateString()}`}
//                                         </Typography>
//                                         <Typography
//                                             gutterBottom
//                                             variant='body2'
//                                             component='div'
//                                         >
//                                             {`Died: ${p.death === null ? '-' : p.death.toDateString()}`}
//                                         </Typography>
//                                         {isOldest && (
//                                             <Typography variant="body2" color="error">
//                                                 Oldest Photographer
//                                             </Typography>
//                                         )}
//                                         {isYoungest && (
//                                             <Typography variant="body2" color="success">
//                                                 Youngest Photographer
//                                             </Typography>
//                                         )}
//                                     </CardContent>
//                                 </CardActionArea>
//                                 <CardActions className='portButCl'>
//                                     <IconButton size='small' onClick={() => { handleOpen(p); setIsFormOpen(true); }}>
//                                         <EditIcon aria-label='edit' sx={{ color: '#212121' }} />
//                                     </IconButton>
//                                     <IconButton size='small'>
//                                         <ConfirmationDialog
//                                             title='Confirmation'
//                                             description='Are you sure you want to delete this photographer?'
//                                             response={() => handleConfirmation(p)}
//                                         >
//                                             {(showDialog) => (
//                                                 <DeleteIcon
//                                                     onClick={showDialog}
//                                                     aria-label='delete'
//                                                     sx={{ color: '#212121' }}
//                                                 />
//                                             )}
//                                         </ConfirmationDialog>
//                                     </IconButton>
//                                 </CardActions>
//                             </Card>
//                         </Grid>
//                     );
//                 })}
//             </Grid>

//             {/* Pagination Controls */}
//             <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
//                 <Button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={currentPage === 1}
//                 >
//                     Previous
//                 </Button>
//                 <Typography variant="body1" sx={{ margin: '0 16px' }}>
//                     Page {currentPage} of {totalPages}
//                 </Typography>
//                 <Button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                 >
//                     Next
//                 </Button>
//             </Box>

//             {/* Photographer Form Dialog */}
//             <PhotographerForm
//                 open={isFormOpen}
//                 onClose={() => {
//                     setIsFormOpen(false);
//                     handleClose();
//                 }}
//                 onSubmit={selectedPhotographer ? handleEditPhotographer : handleAddPhotographer}
//                 defaultValues={
//                     selectedPhotographer
//                         ? {
//                               name: selectedPhotographer.name,
//                               birth: selectedPhotographer.birth, // Already a Date object
//                               death: selectedPhotographer.death, // Already a Date object or null
//                               profilepicUrl: selectedPhotographer.profilepicUrl,
//                               description: selectedPhotographer.description,
//                           }
//                         : undefined
//                 }
//             />
//         </>
//     );
// }

// export default Overview;



// import { useState, useEffect } from 'react';
// import AddIcon from '@mui/icons-material/Add';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';
// import FilterListIcon from '@mui/icons-material/FilterList';
// import { Card, CardActionArea, CardActions, CardContent, CardMedia, Grid, IconButton, Typography, Box, Button } from '@mui/material';
// import { useNavigate } from 'react-router-dom';

// import usePhotographerStore from '../stores/PhotographerStore';
// import '../styles/CardStyles.css';
// import Photographer from '../model/Photographer';
// import ConfirmationDialog from './ModalPopup';
// import PhotographerForm from './PhotographerForm';

// function Overview() {
//     const navigate = useNavigate();
//     const { photographers, deletePhotographer, addPhotographer, editPhotographer, handleOpen, handleClose, selectedPhotographer, fetchMore } = usePhotographerStore();
//     const [isFormOpen, setIsFormOpen] = useState(false);
//     const [filterAlive, setFilterAlive] = useState(false); // State for filtering alive photographers
//     const [currentPage, setCurrentPage] = useState(1); // State for current page
//     const photographersPerPage = 8; // Number of photographers per page
//     const [loading, setLoading] = useState(true); // Loading state for fetching data

//     console.log("Overview component rendered");
//     // Fetch photographers when the component is mounted
//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             console.log("fetching use effect")
//             await fetchPhotographers();
//             setLoading(false);
//         };

//         fetchData();
//     }, [fetchPhotographers]);

//     // Calculate oldest and youngest photographers
//     const oldestPhotographer = photographers.reduce((oldest, p) =>
//         (!oldest || p.birth < oldest.birth) ? p : oldest, null as Photographer | null
//     );

//     const youngestPhotographer = photographers.reduce((youngest, p) =>
//         (!youngest || p.birth > youngest.birth) ? p : youngest, null as Photographer | null
//     );

//     // Filter photographers based on the filterAlive state
//     const filteredPhotographers = filterAlive
//         ? photographers.filter((p) => p.death === null)
//         : photographers;

//     // Pagination logic
//     const indexOfLastPhotographer = currentPage * photographersPerPage;
//     const indexOfFirstPhotographer = indexOfLastPhotographer - photographersPerPage;
//     const currentPhotographers = filteredPhotographers.slice(indexOfFirstPhotographer, indexOfLastPhotographer);

//     // Total number of pages
//     const totalPages = Math.ceil(filteredPhotographers.length / photographersPerPage);

//     // Handle page change
//     const handlePageChange = (newPage: number) => {
//         setCurrentPage(newPage);
//     };

//     const handleConfirmation = (p: Photographer) => {
//         deletePhotographer(p.id);
//         console.log('Confirmed!');
//     };

//     const handleAddPhotographer = (data: Omit<Photographer, 'id'>) => {
//         const newPhotographer: Photographer = {
//             id: Math.floor(Math.random() * 1000), // Generate a random ID
//             ...data,
//         };
//         addPhotographer(newPhotographer);
//     };

//     const handleEditPhotographer = (data: Omit<Photographer, 'id'>) => {
//         if (selectedPhotographer) {
//             const updatedPhotographer = {
//                 ...selectedPhotographer,
//                 ...data,
//             };
//             editPhotographer(updatedPhotographer);
//         }
//     };

//     // Open the form when a photographer is selected for editing
//     useEffect(() => {
//         if (selectedPhotographer) {
//             setIsFormOpen(true); // Open the form when a photographer is selected
//         }
//     }, [selectedPhotographer]);

//     // Loading state - show loading indicator when photographers are being fetched
//     if (loading) {
//         return <Typography variant="h6" align="center">Loading photographers...</Typography>;
//     }

//     return (
//         <>
//             <Grid container spacing={2} sx={{height:'90vh'}}>
//                 <Grid item xs={12} alignItems={'center'}>
//                     <Typography align='center' variant='h4'>
//                         Photographer Overview
//                     </Typography>
//                 </Grid>
//                 <Grid item xs={12} display={'flex'} justifyContent={'flex-end'}>
//                     <Box display="flex" alignItems="center">
//                         <IconButton onClick={() => setFilterAlive(!filterAlive)} aria-label='filter'>
//                             <FilterListIcon sx={{ color: filterAlive ? 'primary.main' : 'black' }} />
//                         </IconButton>
//                     </Box>
//                     <IconButton onClick={() => { handleOpen(); setIsFormOpen(true); }} aria-label='add'>
//                         <AddIcon sx={{ color: 'black' }} />
//                     </IconButton>
//                 </Grid>
//                 {currentPhotographers.map((p: Photographer) => {
//                     const isOldest = p.id === oldestPhotographer?.id;
//                     const isYoungest = p.id === youngestPhotographer?.id;

//                     return (
//                         <Grid key={p.id} item xs={12} md={3} display={'flex'} justifyContent={'center'}>
//                             <Card sx={{
//                                 maxWidth: 345,
//                                 width: 345,
//                                 border: isOldest ? '2px solid red' : isYoungest ? '2px solid green' : 'none'
//                             }} className='portCardCl'>
//                                 <CardActionArea
//                                     onClick={() => navigate(`/photographers/${p.id}`)} className='portBodyCl'>
//                                     <CardMedia
//                                         sx={{
//                                             height: 300,
//                                             width: 345,
//                                             objectFit: 'cover',
//                                         }}
//                                         image={p.profilepicUrl}
//                                         title={p.name}
//                                     />
//                                     <CardContent sx={{ height: 'auto' }}>
//                                         <Typography
//                                             gutterBottom
//                                             variant='h5'
//                                             fontStyle={'oblique'}
//                                             component='div'
//                                         >{`${p.name}`}</Typography>
//                                         <Typography
//                                             gutterBottom
//                                             variant='body1'
//                                             component='div'
//                                         >
//                                             {`Born: ${p.birth.toDateString()}`}
//                                         </Typography>
//                                         <Typography
//                                             gutterBottom
//                                             variant='body2'
//                                             component='div'
//                                         >
//                                             {`Died: ${p.death === null ? '-' : p.death.toDateString()}`}
//                                         </Typography>
//                                         {isOldest && (
//                                             <Typography variant="body2" color="error">
//                                                 Oldest Photographer
//                                             </Typography>
//                                         )}
//                                         {isYoungest && (
//                                             <Typography variant="body2" color="success">
//                                                 Youngest Photographer
//                                             </Typography>
//                                         )}
//                                     </CardContent>
//                                 </CardActionArea>
//                                 <CardActions className='portButCl'>
//                                     <IconButton size='small' onClick={() => { handleOpen(p); setIsFormOpen(true); }}>
//                                         <EditIcon aria-label='edit' sx={{ color: '#212121' }} />
//                                     </IconButton>
//                                     <IconButton size='small'>
//                                         <ConfirmationDialog
//                                             title='Confirmation'
//                                             description='Are you sure you want to delete this photographer?'
//                                             response={() => handleConfirmation(p)}
//                                         >
//                                             {(showDialog) => (
//                                                 <DeleteIcon
//                                                     onClick={showDialog}
//                                                     aria-label='delete'
//                                                     sx={{ color: '#212121' }}
//                                                 />
//                                             )}
//                                         </ConfirmationDialog>
//                                     </IconButton>
//                                 </CardActions>
//                             </Card>
//                         </Grid>
//                     );
//                 })}
//             </Grid>

//             {/* Pagination Controls */}
//             <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
//                 <Button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={currentPage === 1}
//                 >
//                     Previous
//                 </Button>
//                 <Typography variant="body1" sx={{ margin: '0 16px' }}>
//                     Page {currentPage} of {totalPages}
//                 </Typography>
//                 <Button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                 >
//                     Next
//                 </Button>
//             </Box>

//             {/* Photographer Form Dialog */}
//             <PhotographerForm
//                 open={isFormOpen}
//                 onClose={() => {
//                     setIsFormOpen(false);
//                     handleClose();
//                 }}
//                 onSubmit={selectedPhotographer ? handleEditPhotographer : handleAddPhotographer}
//                 defaultValues={
//                     selectedPhotographer
//                         ? {
//                             name: selectedPhotographer.name,
//                             birth: selectedPhotographer.birth, // Already a Date object
//                             death: selectedPhotographer.death, // Already a Date object or null
//                             profilepicUrl: selectedPhotographer.profilepicUrl,
//                             description: selectedPhotographer.description,
//                         }
//                         : undefined
//                 }
//             />
//         </>
//     );
// }

// export default Overview;




import { useState, useEffect, useCallback, useRef } from 'react';
import { 
    Card, CardActionArea, CardActions, CardContent, CardMedia,
    Grid, IconButton, Typography, Box, CircularProgress, Container
} from '@mui/material';
import { Add, Delete, Edit, FilterList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import usePhotographerStore from '../stores/PhotographerStore';
import Photographer from '../model/Photographer';
import ConfirmationDialog from './ModalPopup';
import PhotographerForm from './PhotographerForm';
import Charts from '../tests/Charts';

import useConnectionStatusStore from '../stores/connectionStatus';

function Overview() {
    const navigate = useNavigate();
    const {
        photographers,
        loading,
        hasMore,
        filterAlive,
        selectedPhotographer,
        handleOpen,
        handleClose,
        fetchMore,
        deletePhotographer,
        addPhotographer,
        editPhotographer,
        toggleFilter
    } = usePhotographerStore();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [initialLoad, setInitialLoad] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { isOnline } = useConnectionStatusStore();

    

    // Calculate oldest and youngest photographers
    const { oldest, youngest } = photographers.reduce((acc, p) => {
        if (!acc.oldest || p.birth < acc.oldest.birth) acc.oldest = p;
        if (!acc.youngest || p.birth > acc.youngest.birth) acc.youngest = p;
        return acc;
    }, { oldest: null as Photographer | null, youngest: null as Photographer | null });

    // Infinite scroll observer callback
    const lastItemRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        
        if (observerRef.current) observerRef.current.disconnect();
        
        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMore && !loading) {
                    fetchMore();
                }
            },
            { threshold: 0.1 }
        );

        if (node) observerRef.current.observe(node);
    }, [loading, hasMore, fetchMore]);

    if (photographers.length === 0 && !loading) {
        fetchMore().finally(() => setInitialLoad(true));
    } else if (photographers.length > 0 && !initialLoad) {
        setInitialLoad(true);
    }
    // Reset on filter change
    useEffect(() => {
        setInitialLoad(false);
    }, [filterAlive]);

    const handleAdd = (data: Omit<Photographer, 'id'>) => {
        addPhotographer(data).then(() => {
            setIsFormOpen(false);
            handleClose();
        });
    };

    const handleEdit = (data: Omit<Photographer, 'id'>) => {
        if (selectedPhotographer) {
            editPhotographer({ ...selectedPhotographer, ...data }).then(() => {
                setIsFormOpen(false);
                handleClose();
            });
        }
    };

    return (
        <div>
<Container maxWidth="lg" sx={{ py: 4 }} style={{maxHeight:'80vh', overflowY: 'scroll'}}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                <Grid item xs={12}>
                    <Typography 
                        variant="subtitle1" 
                        align="center" 
                        color={isOnline ? "success.main" : "error.main"}
                    >
                        {isOnline ? "is online" : "not online"}
                    </Typography>
                </Grid>

                    <Typography variant="h4" align="center" gutterBottom>
                        Photographer Overview
                    </Typography>
                </Grid>
                
                <Grid item xs={12} display="flex" justifyContent="flex-end">
                    <IconButton onClick={toggleFilter} aria-label="filter">
                        <FilterList color={filterAlive ? "primary" : "inherit"} />
                    </IconButton>
                    <IconButton 
                        onClick={() => { handleOpen(); setIsFormOpen(true); }} 
                        aria-label="add"
                    >
                        <Add />
                    </IconButton>
                </Grid>

                {photographers.map((p, index) => {
                    const isLast = index === photographers.length - 1;
                    const isOldest = p.id === oldest?.id;
                    const isYoungest = p.id === youngest?.id;

                    return (
                        <Grid 
                            key={p.id} 
                            item 
                            xs={12} sm={6} md={4} lg={3}
                            ref={isLast ? lastItemRef : null}
                        >
                            <Card sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                border: isOldest ? '2px solid red' : 
                                       isYoungest ? '2px solid green' : 'none'
                            }}>
                                <CardActionArea
                                    onClick={() => navigate(`/photographers/${p.id}`)}
                                    sx={{ flexGrow: 1 }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="240"
                                        image={p.profilepicUrl}
                                        alt={p.name}
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h5">
                                            {p.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Born: {p.birth.toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Died: {p.death?.toLocaleDateString() || '-'}
                                        </Typography>
                                        {isOldest && (
                                            <Typography variant="caption" color="error">
                                                Oldest Photographer
                                            </Typography>
                                        )}
                                        {isYoungest && (
                                            <Typography variant="caption" color="success">
                                                Youngest Photographer
                                            </Typography>
                                        )}
                                    </CardContent>
                                </CardActionArea>
                                <CardActions>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpen(p);
                                            setIsFormOpen(true);
                                        }}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <ConfirmationDialog
                                        title="Delete Photographer"
                                        description="Are you sure you want to delete this photographer?"
                                        response={() => deletePhotographer(p.id)}
                                    >
                                        {(onClick) => (
                                            <IconButton onClick={(e) => {
                                                e.stopPropagation();
                                                onClick();
                                            }}>
                                                <Delete />
                                            </IconButton>
                                        )}
                                    </ConfirmationDialog>
                                </CardActions>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {loading && (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && !hasMore && photographers.length > 0 && (
                <Typography align="center" py={4}>
                    No more photographers to load
                </Typography>
            )}

            {!loading && photographers.length === 0 && (
                <Typography align="center" py={4}>
                    No photographers found
                </Typography>
            )}

            <PhotographerForm
                open={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    handleClose();
                }}
                onSubmit={selectedPhotographer ? handleEdit : handleAdd}
                defaultValues={selectedPhotographer || undefined}
            />
        </Container>

        <Box display="flex" justifyContent="center" py={4}>
    <IconButton
        onClick={() => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            } else {
                intervalRef.current = setInterval(() => {
                    addPhotographer({
                        name: `Auto Photographer ${Date.now()}`,
                        birth: new Date(1970 + Math.floor(Math.random() * 50), 0, 1),
                        profilepicUrl: 'https://via.placeholder.com/240x160',
                        death: null, 
                        description: 'bla bla'
                    });
                }, 3000);
            }
        }}
        color="primary"
    >
        <Add />
    </IconButton>
</Box>


        <Charts />
        </div>
    );
}

export default Overview;














































































































// ptr scroll infinit
// import { useState, useEffect } from 'react';
// import AddIcon from '@mui/icons-material/Add';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';
// import FilterListIcon from '@mui/icons-material/FilterList';
// import { Card, CardActionArea, CardActions, CardContent, CardMedia, Grid, IconButton, Typography, Box, Button, CircularProgress } from '@mui/material';
// import { useNavigate } from 'react-router-dom';

// import usePhotographerStore from '../stores/PhotographerStore';
// import '../styles/CardStyles.css';
// import Photographer from '../model/Photographer';
// import ConfirmationDialog from './ModalPopup';
// import PhotographerForm from './PhotographerForm';

// function Overview() {
//     const navigate = useNavigate();
//     const { 
//         photographers, 
//         deletePhotographer, 
//         addPhotographer, 
//         editPhotographer, 
//         handleOpen, 
//         handleClose, 
//         selectedPhotographer, 
//         fetchPhotographers 
//     } = usePhotographerStore();
//     const [isFormOpen, setIsFormOpen] = useState(false);
//     const [filterAlive, setFilterAlive] = useState(false);
//     const [currentPage, setCurrentPage] = useState(1);
//     const photographersPerPage = 8;
//     const [loading, setLoading] = useState(true);
//     const [loadingMore, setLoadingMore] = useState(false);
//     const [hasMore, setHasMore] = useState(true);
//     const [displayedPhotographers, setDisplayedPhotographers] = useState<Photographer[]>([]);

//     // Fetch initial data
//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             await fetchPhotographers();
//             setLoading(false);
//             setHasMore(photographers.length > photographersPerPage);
//         };
//         fetchData();
//     }, [fetchPhotographers]);

//     // Calculate oldest and youngest photographers
//     const oldestPhotographer = photographers.reduce((oldest, p) => 
//         (!oldest || p.birth < oldest.birth) ? p : oldest, null as Photographer | null
//     );

//     const youngestPhotographer = photographers.reduce((youngest, p) => 
//         (!youngest || p.birth > youngest.birth) ? p : youngest, null as Photographer | null
//     );

//     // Filter photographers
//     const filteredPhotographers = filterAlive
//         ? photographers.filter((p) => p.death === null)
//         : photographers;

//     // Generate generic photographers
//     const generateGenericPhotographers = (count: number): Photographer[] => {
//         return Array(count).fill(null).map((_, i) => ({
//             id: -Date.now() - i, // Negative IDs for generic photographers
//             name: `New Photographer ${photographers.length + i + 1}`,
//             birth: new Date(1970 + Math.floor(Math.random() * 30)),
//             death: Math.random() > 0.7 ? new Date(2020 + Math.floor(Math.random() * 10)) : null,
//             profilepicUrl: 'https://via.placeholder.com/150',
//             description: 'New photographer coming soon',
//             isGeneric: true
//         }));
//     };

//     // Update displayed photographers when page or data changes
//     useEffect(() => {
//         const startIndex = 0;
//         const endIndex = currentPage * photographersPerPage;
//         let photosToShow = filteredPhotographers.slice(startIndex, endIndex);
        
//         // If we're at the last real page, add generic photographers
//         const remainingReal = filteredPhotographers.length - photosToShow.length;
//         if (remainingReal <= photographersPerPage && remainingReal > 0) {
//             const needed = photographersPerPage - remainingReal;
//             const genericPhotos = generateGenericPhotographers(needed);
//             photosToShow = [...photosToShow, ...genericPhotos];
//             setHasMore(true); // Keep showing load more button
//         }
        
//         setDisplayedPhotographers(photosToShow);
//     }, [currentPage, filteredPhotographers, photographers.length]);

//     // Load more data when button is clicked
//     const handleLoadMore = async () => {
//         setLoadingMore(true);
//         try {
//             // Check if we need to generate generic photographers
//             const remainingReal = filteredPhotographers.length - (currentPage * photographersPerPage);
//             if (remainingReal <= photographersPerPage && remainingReal > 0) {
//                 // Generate and add 8 new real photographers to the store
//                 const newPhotographers = generateGenericPhotographers(photographersPerPage)
//                     .map(p => ({ ...p, id: Math.floor(Math.random() * 100000), isGeneric: false }));
                
//                 newPhotographers.forEach(p => addPhotographer(p));
                
//                 // Wait a bit to simulate API call
//                 await new Promise(resolve => setTimeout(resolve, 500));
//             }
            
//             setCurrentPage(prev => prev + 1);
            
//             // Check if we've reached the end of real photographers
//             if ((currentPage + 1) * photographersPerPage >= filteredPhotographers.length) {
//                 setHasMore(filteredPhotographers.length % photographersPerPage !== 0);
//             }
//         } finally {
//             setLoadingMore(false);
//         }
//     };

//     const handleConfirmation = (p: Photographer) => {
//         deletePhotographer(p.id);
//     };

//     const handleAddPhotographer = (data: Omit<Photographer, 'id'>) => {
//         const newPhotographer: Photographer = {
//             id: Math.floor(Math.random() * 1000),
//             ...data,
//         };
//         addPhotographer(newPhotographer);
//         setHasMore(true);
//     };

//     const handleEditPhotographer = (data: Omit<Photographer, 'id'>) => {
//         if (selectedPhotographer) {
//             const updatedPhotographer = {
//                 ...selectedPhotographer,
//                 ...data,
//             };
//             editPhotographer(updatedPhotographer);
//         }
//     };

//     useEffect(() => {
//         if (selectedPhotographer) {
//             setIsFormOpen(true);
//         }
//     }, [selectedPhotographer]);

//     if (loading) {
//         return <Typography variant="h6" align="center">Loading photographers...</Typography>;
//     }

//     return (
//         <>
//             <Grid container spacing={2}>
//                 <Grid item xs={12} alignItems={'center'}>
//                     <Typography align='center' variant='h4'>
//                         Photographer Overview
//                     </Typography>
//                 </Grid>
//                 <Grid item xs={12} display={'flex'} justifyContent={'flex-end'}>
//                     <Box display="flex" alignItems="center">
//                         <IconButton onClick={() => setFilterAlive(!filterAlive)} aria-label='filter'>
//                             <FilterListIcon sx={{ color: filterAlive ? 'primary.main' : 'black' }} />
//                         </IconButton>
//                     </Box>
//                     <IconButton onClick={() => { handleOpen(); setIsFormOpen(true); }} aria-label='add'>
//                         <AddIcon sx={{ color: 'black' }} />
//                     </IconButton>
//                 </Grid>
//                 {displayedPhotographers.map((p: Photographer & { isGeneric?: boolean }) => {
//                     const isOldest = p.id === oldestPhotographer?.id;
//                     const isYoungest = p.id === youngestPhotographer?.id;

//                     return (
//                         <Grid key={p.id} item xs={12} md={3} display={'flex'} justifyContent={'center'}>
//                             <Card sx={{
//                                 maxWidth: 345,
//                                 width: 345,
//                                 border: isOldest ? '2px solid red' : isYoungest ? '2px solid green' : 'none',
//                                 opacity: p.isGeneric ? 0.8 : 1
//                             }} className='portCardCl'>
//                                 <CardActionArea
//                                     onClick={() => !p.isGeneric && navigate(`/photographers/${p.id}`)} 
//                                     className='portBodyCl'
//                                     disabled={p.isGeneric}
//                                 >
//                                     <CardMedia
//                                         sx={{
//                                             height: 300,
//                                             width: 345,
//                                             objectFit: 'cover',
//                                         }}
//                                         image={p.profilepicUrl}
//                                         title={p.name}
//                                     />
//                                     <CardContent sx={{ height: 'auto' }}>
//                                         <Typography
//                                             gutterBottom
//                                             variant='h5'
//                                             fontStyle={'oblique'}
//                                             component='div'
//                                         >
//                                             {p.name}
//                                             {p.isGeneric && (
//                                                 <Typography variant="caption" color="text.secondary" display="block">
//                                                     (Coming Soon)
//                                                 </Typography>
//                                             )}
//                                         </Typography>
//                                         <Typography
//                                             gutterBottom
//                                             variant='body1'
//                                             component='div'
//                                         >
//                                             {`Born: ${p.birth.toDateString()}`}
//                                         </Typography>
//                                         <Typography
//                                             gutterBottom
//                                             variant='body2'
//                                             component='div'
//                                         >
//                                             {`Died: ${p.death === null ? '-' : p.death.toDateString()}`}
//                                         </Typography>
//                                         {isOldest && !p.isGeneric && (
//                                             <Typography variant="body2" color="error">
//                                                 Oldest Photographer
//                                             </Typography>
//                                         )}
//                                         {isYoungest && !p.isGeneric && (
//                                             <Typography variant="body2" color="success">
//                                                 Youngest Photographer
//                                             </Typography>
//                                         )}
//                                     </CardContent>
//                                 </CardActionArea>
//                                 {!p.isGeneric && (
//                                     <CardActions className='portButCl'>
//                                         <IconButton size='small' onClick={() => { handleOpen(p); setIsFormOpen(true); }}>
//                                             <EditIcon aria-label='edit' sx={{ color: '#212121' }} />
//                                         </IconButton>
//                                         <IconButton size='small'>
//                                             <ConfirmationDialog
//                                                 title='Confirmation'
//                                                 description='Are you sure you want to delete this photographer?'
//                                                 response={() => handleConfirmation(p)}
//                                             >
//                                                 {(showDialog) => (
//                                                     <DeleteIcon
//                                                         onClick={showDialog}
//                                                         aria-label='delete'
//                                                         sx={{ color: '#212121' }}
//                                                     />
//                                                 )}
//                                             </ConfirmationDialog>
//                                         </IconButton>
//                                     </CardActions>
//                                 )}
//                             </Card>
//                         </Grid>
//                     );
//                 })}
//             </Grid>

//             {/* Pagination Controls */}
//             <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
//                 <Button
//                     onClick={() => setCurrentPage(prev => prev - 1)}
//                     disabled={currentPage === 1}
//                 >
//                     Previous
//                 </Button>
//                 <Typography variant="body1" sx={{ margin: '0 16px' }}>
//                     Page {currentPage}
//                 </Typography>
//                 <Button
//                     onClick={handleLoadMore}
//                     disabled={loadingMore}
//                 >
//                     {loadingMore ? <CircularProgress size={24} /> : 'Load More'}
//                 </Button>
//             </Box>

//             {/* Photographer Form Dialog */}
//             <PhotographerForm
//                 open={isFormOpen}
//                 onClose={() => {
//                     setIsFormOpen(false);
//                     handleClose();
//                 }}
//                 onSubmit={selectedPhotographer ? handleEditPhotographer : handleAddPhotographer}
//                 defaultValues={
//                     selectedPhotographer
//                         ? {
//                             name: selectedPhotographer.name,
//                             birth: selectedPhotographer.birth,
//                             death: selectedPhotographer.death,
//                             profilepicUrl: selectedPhotographer.profilepicUrl,
//                             description: selectedPhotographer.description,
//                         }
//                         : undefined
//                 }
//             />
//         </>
//     );
// }

// export default Overview;