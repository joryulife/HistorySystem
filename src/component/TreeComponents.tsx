import React, {useState, useEffect } from 'react';

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

interface LineProps {
    length: number;
    orientation: 'horizontal' | 'vertical';
    x: number;
    y: number;
}

const Line: React.FC<LineProps> = ({ x, y, length, orientation }) => {
    const lineStyle: React.CSSProperties = {
        backgroundColor: 'black',
        position: 'relative',
    };

    if (orientation === 'horizontal') {
        lineStyle.left = x;
        lineStyle.top = y;
        lineStyle.width = length;
        lineStyle.height = 2;
    } else if (orientation === 'vertical') {
        lineStyle.left = x;
        lineStyle.top = y;
        lineStyle.height = length;
        lineStyle.width = 2;
    }

    return <div style={lineStyle} />;
};

// DynamicLines コンポーネントの状態の型定義
interface LineState {
    length: number;
    parent:boolean;
    x: number;
    y: number;
}

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
    const pad = (((node.date - minDate) / (maxDate - minDate) / 3) * windowWidth - parentpadding);
    //const [verticalLine, setVerticalLine] = useState<LineState>({ length: 50,x: 0, y: 0 });
    //const [horizontalLine, setHorizontalLine] = useState<LineState>({ length: 20 ,x: 0, y: 0});
    
    const [children, setChildren] = useState<JSX.Element[]>([]);
    
    useEffect(() => {
        const newChildren = buildTree(
            nodes,
            id,
            handleNodeClick,
            maxDate,
            minDate,
            windowWidth,
            ((node.date - minDate) / (maxDate - minDate)/ 3) * windowWidth - parentpadding,
        );
        setChildren(newChildren);
    }, [handleNodeClick, id, maxDate, minDate, node.date, nodes, parentpadding, windowWidth]);

    //const hasChildNodes = hasChildren(nodes, id);
    return (
        /*<TreeItemDynamic
            W={(((node.date - minDate) / (maxDate - minDate) / 3) * windowWidth - parentpadding) > 40 
            ? (((node.date - minDate) / (maxDate - minDate) / 3) * windowWidth - parentpadding) 
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
        </TreeItemDynamic>*/
        <TreeItem
            nodeId={id}
            onClick={() => handleNodeClick(id)}
            sx={{
                // ここに必要なスタイルを追加
                paddingLeft: `${pad}px`,
            }}
        >
            <Box alignItems="center" display="flex" flexDirection="row">
                <Line
                    length={50}
                    orientation="vertical"
                    x={-pad}
                    y={0}
                />
                <Line
                    length={pad}
                    orientation="horizontal"
                    x={-pad}
                    y={0}
                />
                <CustomNode node={node} />
            </Box>
            {children}
        </TreeItem>
    );
}

export function buildTree(
    nodes: Nodes,
    parentId: string,
    handleNodeClick: (id: string) => void,
    maxDate: number,
    minDate: number,
    windowWidth: number,
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
