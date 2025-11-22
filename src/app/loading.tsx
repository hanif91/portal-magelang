import { Typography, Box } from "@mui/material";

const Loading = () =>{
    return(
        <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="100vh"
        >
            <Typography variant="h2" color="secondary">PDAM Takalar</Typography>
        </Box>
    )
}

export default Loading;