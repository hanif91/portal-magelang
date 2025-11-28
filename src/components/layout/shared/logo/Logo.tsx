import Link from "next/link";
import Image from "next/image";
import { Box, Typography } from "@mui/material";

const Logo = ({ useLink = false }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Link href={useLink ? "/" : ""} style={{ textDecoration: "none", width: '100%' }}>
        
        <Box 
          sx={{ 
            display: "flex",        
            alignItems: "center",   
            width: "100%",          
            overflow: "hidden"      
          }}
        >
          <Image
            src="/images/logos/logo.png"
            alt="Logo PDAM"
            width={50}
            height={50}
            style={{ flexShrink: 0 }}
            priority
          />
          
          <Typography 
            variant="h6"
            sx={{ 
              fontWeight: "bold",
              lineHeight: 1.2,
              background: "linear-gradient(to right, #5D87FF, #49beff)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden"
            }}
          >
            Portal PDAM
          </Typography>
        </Box>

      </Link>
    </Box>
  );
};

export default Logo;