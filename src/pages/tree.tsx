import React, { useState, useEffect } from 'react';

import { TreeView, TreeItem } from '@mui/lab';
import { Button, Box } from '@mui/material';

interface NodeData {
    height?: number;
    img?: string;
    parent: number;
    title: string;
    url: string;
    width?: number;
}

type Nodes = { [id: number]: NodeData };

function CustomImg({
    node,
    imageStatus,
    handleToggleImage,
}: {
    handleToggleImage: () => void;
    imageStatus: { size: { height: number; width: number }; visible: boolean };
    node: NodeData;
}) {
    return (
        <Box display="flex" flexDirection="column">
            <Button
                onClick={handleToggleImage}
                sx={{ alignItems: 'flex-start', flexDirection: 'column', textTransform: 'none' }}
                variant="text"
            >
                <span>{node.title}</span>
                <span>{node.url}</span>
                {imageStatus.visible && node.img && (
                    <img
                        alt={node.title}
                        src={node.img}
                        style={{
                            height: `${imageStatus.size.height}px`,
                            width: `${imageStatus.size.width}px`,
                        }}
                    />
                )}
            </Button>
        </Box>
    );
}

function buildTree(
    nodes: Nodes,
    parentId: number,
    imageStatus: { [id: number]: { size: { height: number; width: number }; visible: boolean } },
    handleToggleImage: (id: number) => void,
    level = 0,
): JSX.Element[] {
    return Object.entries(nodes)
        .filter(([, node]) => node.parent === parentId)
        .map(([id, node]) => (
            <TreeItem key={id} nodeId={id} style={{ paddingLeft: `${level * 20}px` }}>
                <CustomImg
                    handleToggleImage={() => handleToggleImage(parseInt(id))}
                    imageStatus={imageStatus[parseInt(id)]}
                    node={node}
                />
                {buildTree(nodes, parseInt(id), imageStatus, handleToggleImage, level + 1)}
            </TreeItem>
        ));
}

function findChildren(nodes: Nodes, parentId: number): number[] {
    return Object.entries(nodes)
        .filter(([, node]) => node.parent === parentId)
        .map(([id]) => parseInt(id));
}

const findSiblings = (nodes: Nodes, parentId: number, nodeId: number) => {
    return Object.entries(nodes)
        .filter(([id, node]) => node.parent === parentId && parseInt(id) !== nodeId)
        .map(([id]) => parseInt(id));
};

const bfsFindConnectedNodes = (nodes: Nodes, rootId: number, maxDegree: number) => {
    const connectedNodeIds = new Set<number>();
    let queue: number[] = [rootId];
    let level = 0;

    while (queue.length > 0 && level <= maxDegree) {
        const nextLevelNodes: number[] = [];
        while (queue.length > 0) {
            const currentNodeId = queue.shift();
            if (currentNodeId !== undefined) {
                connectedNodeIds.add(currentNodeId);

                const currentNode = nodes[currentNodeId];
                if (currentNode) {
                    // Add parent
                    if (currentNode.parent !== -1 && !connectedNodeIds.has(currentNode.parent)) {
                        nextLevelNodes.push(currentNode.parent);
                    }

                    // Add siblings
                    const siblings = findSiblings(nodes, currentNode.parent, currentNodeId);
                    siblings.forEach((siblingId) => {
                        if (!connectedNodeIds.has(siblingId)) {
                            nextLevelNodes.push(siblingId);
                        }
                    });

                    // Add children
                    const children = findChildren(nodes, currentNodeId);
                    children.forEach((childId) => {
                        if (!connectedNodeIds.has(childId)) {
                            nextLevelNodes.push(childId);
                        }
                    });
                }
            }
        }
        queue = nextLevelNodes;
        level++;
    }

    return connectedNodeIds;
};

export default function TreePage() {
    const [imageStatus, setImageStatus] = useState<{
        [id: number]: { size: { height: number; width: number }; visible: boolean };
    }>({});
    const [data, setData] = useState<Nodes>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3993/api/history/', {
            body: JSON.stringify({ userId: 1 }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })
            .then((response) => response.json())
            .then((fetchedData) => {
                setData(fetchedData);
                const initialImageStatus: {
                    [id: number]: { size: { height: number; width: number }; visible: boolean };
                } = {};
                Object.keys(fetchedData).forEach((key) => {
                    const numKey = parseInt(key);
                    initialImageStatus[numKey] = { size: { height: 100, width: 100 }, visible: true };
                });
                setImageStatus(initialImageStatus);
            })
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, []);

    const handleToggleImage = (id: number) => {
        setImageStatus((prevState) => {
            const connectedNodes = bfsFindConnectedNodes(data, id, 2); // Set maxDegree to 5
            const newStatus: { [id: number]: { size: { height: number; width: number }; visible: boolean } } = {
                ...prevState,
            };
            for (const nodeId in newStatus) {
                const numNodeId = parseInt(nodeId);
                newStatus[numNodeId].visible = connectedNodes.has(numNodeId);
                if (newStatus[numNodeId].visible) {
                    newStatus[numNodeId].size =
                        numNodeId === id ? { height: 200, width: 200 } : { height: 100, width: 100 };
                }
            }
            return newStatus;
        });
    };

    // Change all node IDs to strings
    const allNodeIds = Object.keys(data).map(String);
    const treeItems = buildTree(data, -1, imageStatus, handleToggleImage);

    return (
        <Box>
            {!loading && (
                <TreeView
                    defaultCollapseIcon={<span>-</span>}
                    defaultExpandIcon={<span>+</span>}
                    defaultExpanded={allNodeIds}
                >
                    {treeItems}
                </TreeView>
            )}
        </Box>
    );
}
