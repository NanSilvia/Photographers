import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import {
    JSXElementConstructor,
    ReactElement,
    ReactNode,
    ReactPortal,
    useState,
} from 'react';
function ConfirmationDialog(props: {
    response: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: (arg0: () => void) => any;
    title:
    | string
    | number
    | boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | ReactElement<any, string | JSXElementConstructor<any>>
    | Iterable<ReactNode>
    | ReactPortal
    | null
    | undefined;
    description:
    | string
    | number
    | boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | ReactElement<any, string | JSXElementConstructor<any>>
    | Iterable<ReactNode>
    | ReactPortal
    | null
    | undefined;
}) {
    //local states
    const [open, setOpen] = useState(false);

    const showDialog = () => {
        setOpen(true);
    };

    const hideDialog = () => {
        setOpen(false);
    };

    const confirmRequest = () => {
        props.response();
        hideDialog();
    };

    return (
        <>
            {props.children(showDialog)}
            {open && (
                <Dialog
                    open={open}
                    onClose={hideDialog}
                    aria-labelledby='alert-dialog-title'
                    aria-describedby='alert-dialog-description'
                >
                    <DialogTitle id='alert-dialog-title'>
                        {props.title}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id='alert-dialog-description'>
                            {props.description}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={confirmRequest} color='primary'>
                            Yes
                        </Button>
                        <Button onClick={hideDialog} color='primary'>
                            No
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
}

export default ConfirmationDialog;