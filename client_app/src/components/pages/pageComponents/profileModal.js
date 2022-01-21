import * as React from 'react';
import Modal from '@mui/material/Modal';
import {Button, Typography} from "@mui/material";
import {Box} from "@mui/system";
import {AccessAlarm} from "@mui/icons-material";

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	backgroundColor: "white",
	width: 400,
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};

export default function ProfileModal({user, children}) {
	const [ open, setOpen ] = React.useState( false );
	const handleOpen = () => setOpen( true );
	const handleClose = () => setOpen( false );

	return (
		<>
			<div>
				{children ? (
					<Button onClick={handleOpen}>Profile</Button>
				) : (<AccessAlarm/>)}

				<Modal
					open={open}
					onClose={handleClose}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				><Box sx={style}>
					<Typography varient={"h1"}>{user.username}</Typography>
				</Box>
				</Modal>
			</div>
		</>
	);
}


