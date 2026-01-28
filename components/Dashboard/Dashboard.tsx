"use client";

import { useEffect, useMemo, useState } from "react";
import { Toolbar, Typography, Divider, IconButton, Box, CssBaseline } from "@mui/material"; 
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import { useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import "./Dashboard.css";
import Image from "next/image";
import SidebarMenu from "./SidebarMenu/SidebarMenu";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Drawer } from "../MaterialSnippets/MaterialSnippets";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import { socket } from "@/socket-client";

export default function Dashboard({ children }: DashboardProps) {
  const [open, setOpen] = useState(true);
  const matches = useMediaQuery("(min-width:769px)");
  const user = useMemo(() => {
    if(typeof window !== "undefined" && localStorage.getItem("userInfo") ) {
      return JSON.parse(localStorage.getItem("userInfo") || "{}") 
    }else{
      return "";
    }
  }, []);

  useEffect(() => {
    socket.emit("newUser", user.userId);
  }, [user.userId]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 768) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    });
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <Navbar
            open={open}
            toggleDrawer={toggleDrawer}
          />
          <Drawer variant="permanent" open={open}>
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: [1],
              }}
            >
              <Link
                href="/"
                style={{ textDecoration: "none", gap: "5px" }}
                className="flex-center"
              >
                <Image
                  src={"/logo.png"}
                  width={"50"}
                  height={"50"}
                  alt="logo"
                  priority
                />
                <Typography
                  variant="h4"
                  sx={{ fontFamily: `"Kanit", sans-serif` }}
                >
                  TaskZen
                </Typography>
              </Link>
              {!matches && <IconButton
                edge="start"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: "10px",
                  color: "#000",
                  display: "block",
                }}
              >
                <CloseIcon
                  sx={{
                    fontSize: "30px",
                    display: "flex",
                    alignItems: "center",
                  }}
                />
              </IconButton>}
            </Toolbar>
            <Divider />
            <SidebarMenu />
          </Drawer>
          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: "100vh",
              overflow: "auto",
            }}
          >
            <Toolbar />
            {children}
          </Box>
        </Box>

        <Toaster 
          position="bottom-right"
          reverseOrder={false}
        />

      </ThemeProvider>
    </Provider>
  );
}