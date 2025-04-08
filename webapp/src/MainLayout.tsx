import React, {useState, useEffect, useRef} from "react";
import {Slider} from "@mui/material";
import {Drawer, Button, Box, Typography} from "@mui/material";
import axios from "axios";
import {ResizableBox} from "react-resizable";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from "@mui/material";
// @ts-ignore
import {MoreHoriz, MoreVert} from "@mui/icons-material"; // Resizing icons
import "react-resizable/css/styles.css";
import Aladin from "./Aladin";
import LightCurvePlot, {LightCurvePlotProps} from "./LichtCurvePlot"; // Import required styles

const drawerWidth = 240;

const MainLayout: React.FC = () => {
        const [showRightPanel, setShowRightPanel] = useState(false);
        const [showBottomPanel, setShowBottomPanel] = useState(false);
        const [rightPanelWidth, setRightPanelWidth] = useState(window.innerWidth * 0.4);
        const [bottomPanelHeight, setBottomPanelHeight] = useState(window.innerHeight * 0.4);
        const [catalog, setCatalog] = useState<any[]>([]);
        const [lcId, setLcId] = useState<LightCurvePlotProps | null>(null);
        const [selectedObj, setSelectedObj] = useState(-1);

        const [fov, setFov] = useState({raMin: 0, raMax: 0, decMin: 0, decMax: 0})


        useEffect(() => {
            const savedWidth = localStorage.getItem("rightPanelWidth");
            const savedHeight = localStorage.getItem("bottomPanelHeight");
            if (savedWidth) setRightPanelWidth(parseInt(savedWidth));
            if (savedHeight) setBottomPanelHeight(parseInt(savedHeight));
        }, []);

        useEffect(() => {
            localStorage.setItem("rightPanelWidth", rightPanelWidth.toString());
            localStorage.setItem("bottomPanelHeight", bottomPanelHeight.toString());
        }, [rightPanelWidth, bottomPanelHeight]);

// Define discrete values
        const sliderValues = ["all", '0.1', '0.4', '0.7', '1.0', '1.3', '1.6', '1.9', '2.2'];
        const zbins = [[0, 10], [0.0, 0.2],
            [0.3, 0.5],
            [0.6, 0.8],
            [0.9, 1.1],
            [1.2, 1.4],
            [1.5, 1.7],
            [1.8, 2.0],
            [2.1, 2.3]]

// Function to handle slider change
        const handleSliderChange = (event: Event, newValue: number | number[]) => {
            setSliderIndex(newValue as number);
        };
        const [sliderIndex, setSliderIndex] = useState(0);

        useEffect(() => {
            updateCatalog();
        }, [sliderIndex, fov]);

// Convert values into marks
        const marks = sliderValues.map((value, index) => ({
            value: index, // Slider works with index positions
            label: value.toString(),
        }));

        const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

        const scrollToRow = (index: number) => {
            if (rowRefs.current[index]) {
                rowRefs.current[index]?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        };

        function updateSelectedRow(index: number) {
            scrollToRow(index);
            setSelectedObj(index);
        }

        function updateCatalog() {
            const zmin = zbins[sliderIndex][0];
            const zmax = zbins[sliderIndex][1];
            const apiUrl = `http://localhost:5000/data?raMin=${fov.raMin}&raMax=${fov.raMax}&decMin=${fov.decMin}&decMax=${fov.decMax}&zMin=${zmin}&zMax=${zmax}`;
            if (showBottomPanel) {
                axios.get(apiUrl)
                    .then(response => {
                        const parsedData = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
                        if (Array.isArray(parsedData)) {
                            setCatalog(parsedData);
                        } else {
                            console.error("Data is not an array:", parsedData);
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching data:", error);
                    });
            } else {
                setCatalog([]);
            }
        }

        function updateFov(newfov: number[], radec: number[]) {
            const newRaMin = radec[0] - newfov[0] / 3;
            const newRaMax = radec[0] + newfov[0] / 3;
            const newDecMin = radec[1] - newfov[1] / 3;
            const newDecMax = radec[1] + newfov[1] / 3;
            if (newRaMin !== fov.raMin || newRaMax !== fov.raMax || newDecMin !== fov.decMin || newDecMax !== fov.decMax) {
                setFov({raMin: newRaMin, raMax: newRaMax, decMin: newDecMin, decMax: newDecMax});
                updateCatalog();
            }
        }

        function showLightCurve(objId: number, ra: number, dec: number) {
            setLcId({objid: objId, ra: ra, dec: dec});
            setShowRightPanel(true);
        }

        const columns = [
            "objectId", "i_ra", "i_dec", "u_cModelFlux", "u_cModelFluxErr", "g_cModelFlux", "g_cModelFluxErr",
            "r_cModelFlux", "r_cModelFluxErr", "i_cModelFlux", "i_cModelFluxErr", "z_cModelFlux", "z_cModelFluxErr",
            "y_cModelFlux", "y_cModelFluxErr", "u_cModelMag", "u_cModelMagErr", "g_cModelMag", "g_cModelMagErr",
            "r_cModelMag", "r_cModelMagErr", "i_cModelMag", "i_cModelMagErr", "z_cModelMag", "z_cModelMagErr",
            "y_cModelMag", "y_cModelMagErr", "ebv", "zmedian", "zmode", "zmean"
        ];

        // @ts-ignore
        // @ts-ignore
        return (
            <Box sx={{height: "100vh", overflow: "hidden", position: "relative", display: "flex"}}>
                {/* ✅ Full-Screen Background */}
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundImage: "url('/hero-bg.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        zIndex: -1,
                    }}
                />

                {/* Sidebar */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            border: "none",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            padding: "10px 0",
                        },
                    }}
                >
                    <Box sx={{width: "80%", textAlign: "left", marginBottom: 2}}>
                        <img src="/lincc-logo.png" style={{height: "64px"}}/>
                    </Box>

                    <Box sx={{flexGrow: 1}}>

                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "Roboto, sans-serif", // MUI default font
                                fontWeight: 500, // Match button font weight
                                letterSpacing: "0.02857em", // Matches MUI button spacing
                                marginBottom: "20px",
                                fontSize: "16px",
                                color: "#1976d2",
                            }}
                        >
                            Redshift Value
                        </Typography>

                        <Slider
                            orientation="vertical"
                            value={sliderIndex} // Default to first value ("all")
                            onChange={handleSliderChange}
                            step={null} // ✅ Prevents in-between values
                            marks={marks} // ✅ Displays labels at the marks
                            track={false}
                            min={0}
                            max={sliderValues.length - 1}
                            sx={{
                                height: "450px",
                                '& .MuiSlider-thumb': {width: 12, height: 12},
                            }}
                        />
                    </Box>

                    <Box
                        sx={{
                            width: "100%",
                            textAlign: "center",
                            marginBottom: "20px", // ✅ Fix: Padding exactly matches bottom panel
                            transition: "padding-bottom 0.3s ease",
                        }}
                    >
                        <Button fullWidth onClick={() => setShowBottomPanel(!showBottomPanel)}>
                            {showBottomPanel ? "Hide Catalog" : "Show Catalog"}
                        </Button>
                    </Box>


                </Drawer>

                {/* ✅ Main Content Shrinks with Panels */}
                <Box
                    sx={{
                        flexGrow: 1,
                        transition: "margin 0.3s ease",
                        marginRight: showRightPanel ? `${rightPanelWidth}px` : "0",
                        marginBottom: showBottomPanel ? `${bottomPanelHeight}px` : "0",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                    }}
                >
                    <Aladin sliderIndex={sliderIndex} setFov={updateFov} catalog={catalog}
                            setSelectedObj={updateSelectedRow}/>
                </Box>

                {/* ✅ Right Panel (Adjusts Height with Bottom Panel) */}
                {showRightPanel && (
                    <ResizableBox
                        width={rightPanelWidth}
                        height={window.innerHeight - (showBottomPanel ? bottomPanelHeight : 0)}
                        axis="x"
                        resizeHandles={["w"]} // ✅ Keep resizing active
                        minConstraints={[200, 100]}
                        maxConstraints={[window.innerWidth * 0.6, window.innerHeight]}
                        onResizeStop={(e, data) => setRightPanelWidth(data.size.width)}
                        style={{
                            position: "fixed",
                            right: 0,
                            top: 0,
                            bottom: showBottomPanel ? `${bottomPanelHeight}px` : "0",
                            background: "rgba(210, 210, 210, 0.2)",
                            backdropFilter: "blur(10px)",
                            zIndex: 11,
                            overflow: "hidden",
                            transition: "height 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderLeft: "2px solid rgba(255,255,255,0.2)",
                        }}
                    >
                        <Box sx={{padding: "20px", width: "100%"}}>
                            <LightCurvePlot objid={lcId?.objid} ra={lcId?.ra} dec={lcId?.dec}/>
                            <Button onClick={() => setShowRightPanel(false)}>Close</Button>
                        </Box>

                        {/* ✅ Custom Resize Handle (Three Dots) */}
                        <Box
                            sx={{
                                position: "absolute",
                                left: -12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "ew-resize",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                padding: "4px",
                            }}
                        >
                            <MoreVert sx={{fontSize: 30, color: "#999"}}/>
                        </Box>
                    </ResizableBox>

                )}

                {/* ✅ Bottom Panel (Right Panel Shrinks With It) */}
                {showBottomPanel && (
                    <ResizableBox
                        height={bottomPanelHeight}
                        width={window.innerWidth - drawerWidth}
                        axis="y"
                        resizeHandles={["n"]}
                        minConstraints={[100, 100]}
                        maxConstraints={[window.innerWidth - drawerWidth, window.innerHeight * 0.6]}
                        onResizeStop={(e, data) => setBottomPanelHeight(data.size.height)}
                        style={{
                            position: "fixed",
                            left: `${drawerWidth}px`,
                            bottom: 0,
                            width: `calc(100vw - ${drawerWidth}px)`,
                            background: "rgba(210, 210, 210, 0.2)",
                            backdropFilter: "blur(10px)",
                            zIndex: 13,
                            overflow: "hidden",
                            transition: "height 0.3s ease",
                            display: "flex",
                            flexDirection: "column",  // ✅ Ensure elements stack vertically
                        }}
                    >
                        {/* Title Section */}
                        <Box sx={{padding: "10px", background: "rgba(255, 255, 255, 0.1)", textAlign: "center"}}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily: "Roboto, sans-serif", // MUI default font
                                    fontWeight: 500, // Match button font weight
                                    letterSpacing: "0.02857em", // Matches MUI button spacing
                                    marginTop: "10px",
                                    fontSize: "16px",
                                    color: "#1976d2",
                                }}
                            >
                                Rubin Object Catalog
                            </Typography>
                        </Box>

                        {/* Table Section - Ensures the table takes up remaining space */}
                        <Box sx={{flexGrow: 1, overflow: "hidden", display: "flex", flexDirection: "column"}}>
                            <TableContainer
                                component={Paper}
                                sx={{
                                    flexGrow: 1,
                                    overflow: "auto",
                                    width: "100%",
                                    backgroundColor: "rgba(255, 255, 255, 0.1)", // ✅ Transparent table background
                                    backdropFilter: "blur(5px)", // ✅ Soft blur for glass effect
                                    boxShadow: "none", // ✅ Remove paper shadow
                                }}
                            >
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column}
                                                    sx={{
                                                        fontWeight: "bold",
                                                        backgroundColor: "rgba(230, 230, 230, 1)", // ✅ Slightly opaque header
                                                        color: "#4A64B9",
                                                    }}
                                                >
                                                    {column}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {catalog.map((row, index) => (
                                            // @ts-ignore
                                            <TableRow
                                                key={index}
                                                ref={(el: any) => (rowRefs.current[index] = el)}
                                                sx={{
                                                    backgroundColor: index === selectedObj ? "rgba(40,87,191,0.3)" : index % 2 === 0 ? "rgba(250, 250, 250, 0.2)" : "rgba(189, 189, 189, 0.1)", // ✅ Alternating row colors
                                                    "&:hover": {
                                                        backgroundColor: "rgba(255, 255, 255, 0.7)", // ✅ Row highlight on hover
                                                    },
                                                }}
                                            >
                                                <TableCell>
                                                    <Button fullWidth
                                                            onClick={() => showLightCurve(row["objectId"], row["i_ra"], row["i_dec"])}>ShowLightCurve</Button>
                                                </TableCell>
                                                {columns.map((column) => (
                                                    <TableCell key={column} sx={{
                                                        color: "rgb(70, 70, 70)",
                                                        borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
                                                    }}>
                                                        {row[column]}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Box>

                        {/* Resize Handle */}
                        <Box
                            sx={{
                                position: "absolute",
                                top: -10,
                                left: "50%",
                                transform: "translateX(-50%)",
                                cursor: "ns-resize",
                                padding: "5px",
                                background: "rgba(255,255,255,0.2)",
                                borderRadius: "5px",
                            }}
                        >
                            <MoreHoriz sx={{fontSize: 24, color: "#999"}}/>
                        </Box>
                    </ResizableBox>


                )}
            </Box>
        );
    }
;

export default MainLayout;
