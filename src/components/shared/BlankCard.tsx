import { Card } from "@mui/material";

type Props = {
  className?: string;
  children: React.ReactNode;
  sx?: any;
};

const BlankCard = ({ children, className, sx }: Props) => {
  return (
    <Card
      sx={{ p: 0, position: "relative", ...sx }}
      className={className}
      elevation={9}
    >
      {children}
    </Card>
  );
};

export default BlankCard;
