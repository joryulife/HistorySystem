import React, { useState, useEffect } from 'react';

import { TreeView } from '@mui/lab';
import { AppBar, Box, Slider, Typography, Toolbar, ThemeProvider } from '@mui/material';

import LogoutButton from '../component/LogoutButton';
import { buildTree, getNodesToExpand } from '../component/TreeComponents';
import { withAuth } from '../lib/withAuth';
import styles from '../styles/imgline.module.css';

import { useWindowWidth } from './api/hooks';
import { theme } from './api/styles';

import type { Nodes } from './api/types';

const apiPath = '/api/imgline/';

const TreePage: React.FC = () => {
    const [seekValue, setSeekValue] = useState(0);
    const [minDate, setMinDate] = useState(0);
    const [maxDate, setMaxDate] = useState(0);
    const [data, setData] = useState<Nodes>({});
    const [loading, setLoading] = useState(true);
    const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
    const windowWidth = useWindowWidth();

    useEffect(() => {
        fetch(apiPath, {
            credentials: 'include',
            method: 'GET',
        })
            .then((response) => response.json())
            .then((fetchedData: Nodes) => {
                console.log(fetchedData);
                setData(fetchedData);
                const dates = Object.values(fetchedData).map((node) => node.date);
                setMinDate(Math.min(...dates));
                setMaxDate(Math.max(...dates));
                setSeekValue(Math.min(...dates));
            })
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, []);

    const seekDate = new Date(seekValue).toLocaleString();

    const handleNodeClick = (nodeId: string) => {
        const clickedNode = data[nodeId];
        setSeekValue(clickedNode.date);
        const nodesToExpand = getNodesToExpand(data, clickedNode.date);
        setExpandedNodes(nodesToExpand);
    };

    useEffect(() => {
        const nodesToExpand = getNodesToExpand(data, seekValue);
        setExpandedNodes(nodesToExpand);
    }, [seekValue, data]);

    return (
        <ThemeProvider theme={theme}>
            <div className={styles['infinite-canvas']}>
                <AppBar position="fixed">
                    <Toolbar>
                        <Typography>{seekDate}</Typography>
                        <Slider
                            aria-labelledby="input-slider"
                            max={maxDate}
                            min={minDate}
                            onChange={(event, newValue) => setSeekValue(newValue as number)}
                            value={seekValue}
                        />
                        <LogoutButton />
                    </Toolbar>
                </AppBar>
                <Box mt={8}>
                    {!loading && (
                        <TreeView
                            defaultCollapseIcon={<span>-</span>}
                            defaultExpandIcon={<span>+</span>}
                            expanded={expandedNodes}
                        >
                            {buildTree(data, '0', handleNodeClick, maxDate, minDate, windowWidth, 0, 0, 0)}
                        </TreeView>
                    )}
                </Box>
            </div>
        </ThemeProvider>
    );
};

export default withAuth(TreePage);
//export default TreePage;

