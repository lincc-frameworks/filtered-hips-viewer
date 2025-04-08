import {Typography} from "@mui/material";
import React, {useMemo, useState} from 'react';
import Plot from "react-plotly.js";
import axios from "axios";

interface LightCurveData {
    band: string;
    midpointMjdTai: number;
    psfFlux: number;
}

export interface LightCurvePlotProps {
    objid: number | undefined;
    ra: number | undefined;
    dec: number | undefined;
}

const LightCurvePlot: React.FC<LightCurvePlotProps> = ({objid, ra, dec}) => {
    // Group data by band


    const [data, setData] = useState<any[]>([]);

    useMemo(() => {
        const apiUrl = `http://localhost:5000/lc?ra=${ra}&dec=${dec}&objid=${objid}`;
        let data: any[] = []
        axios.get(apiUrl)
            .then(response => {
                data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
                const reducedData = data.reduce(
                    (acc, point) => {
                        if (!acc[point.band]) acc[point.band] = [];
                        acc[point.band].push(point);
                        return acc;
                    },
                    {} as Record<string, LightCurveData[]>
                );
                // Create traces for each band
                // @ts-ignore
                const traces = Object.entries(reducedData).map(([band, points]: [string, LightCurveData[]]) => ({
                    x: points.map((p) => p.midpointMjdTai),
                    y: points.map((p) => p.psfFlux),
                    mode: "lines+markers" as const,
                    name: `Band ${band}`,
                    type: "scatter" as const,
                }));

                setData(traces)

            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }, [objid]);


    return (
        <div style={{"width": "100%", "height": "80%"}}>
            <Typography
                variant="h4"
                sx={{
                    fontFamily: "Roboto, sans-serif", // MUI default font
                    fontWeight: 500, // Match button font weight
                    letterSpacing: "0.02857em", // Matches MUI button spacing
                    marginTop: "10px",
                    fontSize: "18px",
                    color: "#1976d2",
                    marginBottom: "20px",
                }}
            >
                Light Curve for Object {objid}
            </Typography>
            <Plot
                data={data}
                layout={{
                    xaxis: {
                        title: {
                            text: 'MJD', // X-axis label
                            font: {
                                size: 14, // Font size for the axis label
                            },
                        },
                    },
                    yaxis: {
                        title: {
                            text: 'PSF Flux', // Y-axis label
                            font: {
                                size: 14, // Font size for the axis label
                            },
                        },
                    },
                    autosize: true,
                    showlegend: true,
                }}
                style={{width: "100%", height: "80%"}}
            />
        </div>
    );
};

export default LightCurvePlot;
