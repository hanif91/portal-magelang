"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./global.css";
import { Toaster } from "react-hot-toast";
import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextTopLoader
          color="#2299DD" /* Warna loading bar (bisa ganti sesuka hati) */
          initialPosition={0.08}
          crawlSpeed={200}
          height={3} /* Ketebalan bar */
          crawl={true}
          showSpinner={false} /* Matikan spinner di pojok kanan kalau tidak suka */
          easing="ease"
          speed={200}
          shadow="0 0 10px #2299DD,0 0 5px #2299DD" /* Efek glowing */
        />
        <ThemeProvider theme={baselightTheme}>
          <Toaster />
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
