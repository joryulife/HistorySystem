import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';

import styled from '@emotion/styled';
import { TreeItem } from '@mui/lab';
import { Box, Button } from '@mui/material';

import type { NodeData, Nodes, TreeItemProps } from '../pages/api/types';
const large = 150;
const small = 75;
export const TreeItemDynamic = styled(TreeItem)(({ W, parent, hc }: TreeItemProps) => ({
    '& .Mui-expanded': {
        position: 'relative',
    },
    '& .Mui-expanded::after': {
        backgroundColor: `${parent == '0' ? '' : 'black'}`,
        content: '""',
        height: '2px',
        left: `${-W + 20}px`,
        'pointer-events': 'none',
        position: 'absolute',
        top: `50px`,
        width: `${W - 20}px`,
    },
    '& .MuiTreeItem-root': {
        position: 'relative',
    },
    '& .MuiTreeItem-root::before': {
        backgroundColor: `${hc ? 'red' : ''}`,
        content: '""',
        height: `100%`,
        left: `20px`,
        'pointer-events': 'none',
        position: 'absolute',
        top: '0',
        width: '2px',
    },
}));

function hasChildren(nodes: Nodes, parentId: string): boolean {
    return Object.values(nodes).some(node => node.parent === parentId);
}

export function CustomNode({ node }: { node: NodeData }) {
    const aspectRatio = node.width && node.height ? node.width / node.height : 1;
    const [imgSize, setImgSize] = useState({ height: small, width: small * aspectRatio });
    const [isTextExpanded, setIsTextExpanded] = useState(false);

    const handleClick = () => {
        if (imgSize.height === small) {
            setImgSize({ height: large, width: large * aspectRatio });
        } else {
            setImgSize({ height: small, width: small * aspectRatio });
        }
    };

    const handleTextToggle = () => {
        setIsTextExpanded(!isTextExpanded);
    };

    const truncateText = (text: string) => {
        if (isTextExpanded || text.length <= 50) {
            return text;
        } else {
            return text.substr(0, 47) + '...';
        }
    };

    return (
        <Box alignItems="center" display="flex" flexDirection="row">
            {node.img && (
                <img
                    alt={node.title}
                    onClick={handleClick}
                    src={node.img}
                    style={{
                        height: `${imgSize.height}px`,
                        marginRight: '10px',
                        objectFit: 'cover',
                        width: `${imgSize.width}px`,
                    }}
                />
            )}
            <Box display="flex" flexDirection="column">
                <Button
                    onClick={handleTextToggle}
                    sx={{ alignItems: 'flex-start', flexDirection: 'column', textTransform: 'none' }}
                    variant="text"
                >
                    <span style={{ textAlign: 'left' }}>
                        {new Date(node.date).toLocaleString()} {truncateText(node.title)}
                    </span>
                    <span style={{ textAlign: 'left' }}>{truncateText(node.url)}</span>
                </Button>
            </Box>
        </Box>
    );
}

export function TreeItemComponent({
    handleNodeClick, //ノードがクリックされたときの処理を定義する関数
    id, //現在のノードのID
    maxDate,
    minDate,
    node, //現在のノードのデータ
    nodes, // 全てのノードのデータ
    parentpadding,
    windowWidth,
}: {
    handleNodeClick: (id: string) => void;
    id: string;
    maxDate: number;
    minDate: number;
    node: NodeData;
    nodes: Nodes;
    parentpadding: number;
    windowWidth: number;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{
        bottom: number | null;
        height: number | null;
        left: number | null;
        right: number | null;
        top: number | null;
        width: number | null;
    }>({
        bottom: null,
        height: null,
        left: null,
        right: null,
        top: null,
        width: null,
    });
    const [children, setChildren] = useState<JSX.Element[]>([]);

    useLayoutEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setPosition({
                //left: rect.left + window.scrollX,
                //top: rect.top + window.scrollY,
                bottom: rect.bottom,
                height: rect.height,
                left: rect.left,
                right: rect.right,
                top: rect.top,
                width: rect.width,
            });
        }
    }, [ref, id]);

    useEffect(() => {
        if (position.top !== null && position.left !== null) {
            const newChildren = buildTree(
                nodes,
                id,
                handleNodeClick,
                maxDate,
                minDate,
                windowWidth,
                position.top, // ここでparentHとして渡すべき
                position.left, // ここでparentWとして渡すべき
                ((node.date - minDate) / (maxDate - minDate)) * windowWidth - parentpadding,
            );
            setChildren(newChildren);
        }
    }, [handleNodeClick, id, maxDate, minDate, node.date, nodes, parentpadding, windowWidth, position]);
    const hasChildNodes = hasChildren(nodes, id);
    const pad = (((node.date - minDate) / (maxDate - minDate) / 1.5) * windowWidth - parentpadding) < 20 ? 20 :(((node.date - minDate) / (maxDate - minDate) / 1.5) * windowWidth - parentpadding);
    return (
        <TreeItemDynamic
            W={(((node.date - minDate) / (maxDate - minDate) / 1.5) * windowWidth - parentpadding) > 40 
            ? (((node.date - minDate) / (maxDate - minDate) / 1.5) * windowWidth - parentpadding) 
            : 40} // nullの場合は0を設定
            hc = {hasChildNodes}
            key={id}
            nodeId={id}
            onClick={() => handleNodeClick(id)}
            parent={node.parent}
            ref={ref}
            style={{
                paddingLeft: `${pad}px`,
            }}
        >
            <CustomNode node={node} />
            {children}
        </TreeItemDynamic>
    );
}

export function buildTree(
    nodes: Nodes,
    parentId: string,
    handleNodeClick: (id: string) => void,
    maxDate: number,
    minDate: number,
    windowWidth: number,
    parentH: number, // position.topを受け取るべき
    parentW: number, // position.leftを受け取るべき
    parentpadding: number,
): JSX.Element[] {
    return Object.entries(nodes)
        .filter(([, node]) => node.parent === parentId)
        .map(([id, node]) => (
            <TreeItemComponent
                handleNodeClick={handleNodeClick}
                id={id}
                key={id}
                maxDate={maxDate}
                minDate={minDate}
                node={node}
                nodes={nodes}
                parentpadding={parentpadding}
                windowWidth={windowWidth}
            />
        ));
}

export function getNodesToExpand(nodes: Nodes, targetDate: number): string[] {
    return Object.entries(nodes)
        .filter(([, node]) => node.date <= targetDate)
        .map(([id]) => id);
}
