import React, { useState, useEffect } from 'react';

import { TreeView, TreeItem } from '@mui/lab';
import { AppBar, Button, Box, Slider, Typography, Toolbar, ThemeProvider, createTheme } from '@mui/material';

interface NodeData {
    date: number;
    parent: number;
    title: string;
    url: string;
}

type Nodes = { [id: number]: NodeData };

function CustomNode({ node }: { node: NodeData }) {
    return (
        <Box display="flex" flexDirection="column">
            <Button
                sx={{ alignItems: 'flex-start', flexDirection: 'column', textTransform: 'none' }}
                variant="text"
            >
                <span>{new Date(node.date).toLocaleString()}</span>
                <span>{node.title}</span>
                <span>{node.url}</span>
            </Button>
        </Box>
    );
}

function buildTree(
    nodes: Nodes,
    parentId: number,
    level = 0
): JSX.Element[] {
    return Object.entries(nodes)
        .filter(([, node]) => node.parent === parentId)
        .map(([id, node]) => (
            <TreeItem
                key={id}
                nodeId={id}
                style={{ paddingLeft: `${level * 20}px` }}
            >
                <CustomNode node={node} />
                {buildTree(nodes, parseInt(id), level + 1)}
            </TreeItem>
        ));
}

export default function TreePage() {
    const [seekValue, setSeekValue] = useState(0);
    const [minDate, setMinDate] = useState(0);
    const [maxDate, setMaxDate] = useState(0);
    const [data, setData] = useState<Nodes>({});
    const [loading, setLoading] = useState(true);
    const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

    useEffect(() => {
        fetch('http://localhost:3993/api/history/', {
            body: JSON.stringify({ userId: 1 }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })
            .then((response) => response.json())
            .then((fetchedData: Nodes) => {
                setData(fetchedData);
                const dates = Object.values(fetchedData).map(node => node.date);
                setMinDate(Math.min(...dates));
                setMaxDate(Math.max(...dates));
                setSeekValue(Math.min(...dates));
            })
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setExpandedNodes(Object.entries(data)
            .filter(([, node]) => node.date <= seekValue)
            .map(([id]) => id)
        );
    }, [seekValue, data]);


    // convert timestamp to human readable date
    const seekDate = new Date(seekValue).toLocaleString();

    // custom slider theme
    const theme = createTheme({
        components: {
            MuiSlider: {
                styleOverrides: {
                    rail: {
                        color: 'gray',
                    },
                    thumb: {
                        color: 'red',
                    },
                    track: {
                        color: 'red',
                    },
                },
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <Box>
                <AppBar position="sticky">
                    <Toolbar>
                        <Typography>{seekDate}</Typography>
                        <Slider 
                            aria-labelledby="input-slider" 
                            max={maxDate}
                            min={minDate}
                            onChange={(event, newValue) => setSeekValue(newValue as number)} 
                            value={seekValue} 
                        />
                    </Toolbar>
                </AppBar>
                {!loading && (
                    <TreeView
                        defaultCollapseIcon={<span>-</span>}
                        defaultExpandIcon={<span>+</span>}
                        expanded={expandedNodes}
                    >
                        {buildTree(data, -1, 0)}
                    </TreeView>
                )}
            </Box>
        </ThemeProvider>
    );
}
