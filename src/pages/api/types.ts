export interface NodeData {
    date: number;
    height?: number;
    img?: string;
    parent: string;
    title: string;
    url: string;
    width?: number;
}

export type Nodes = { [id: string]: NodeData };

export interface TreeItemProps {
    W: number;
    parent: string;
}
