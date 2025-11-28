"use client";
import { Grid, Box } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
// components
import DashboardMenus from "../../components/dashboard/DashboardMenu";

const Dashboard = () => {
  return (
    <PageContainer
      title="Dashboard - Portal PDAM MRK"
      description="Portal Aplikasi PDAM Takalar"
    >
      <Box>
        <Grid container spacing={3}>
          <DashboardMenus />
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
