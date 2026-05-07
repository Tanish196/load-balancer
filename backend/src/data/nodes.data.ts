import { ServerNode } from '../types/index.js';

class NodeRegistry {
  private nodes: ServerNode[] = [
    { id: 'Node-A', status: 'healthy', weight: 1 },
    { id: 'Node-B', status: 'healthy', weight: 1 },
    { id: 'Node-C', status: 'healthy', weight: 1 },
  ];

  public getAll(): ServerNode[] {
    // Return a shallow copy to prevent external mutation
    return [...this.nodes];
  }

  public getById(id: string): ServerNode | undefined {
    return this.nodes.find((n) => n.id === id);
  }

  public add(node: ServerNode): void {
    this.nodes.push(node);
  }

  public remove(id: string): void {
    this.nodes = this.nodes.filter((n) => n.id !== id);
  }

  public updateStatus(id: string, status: ServerNode['status']): void {
    const node = this.getById(id);
    if (node) {
      node.status = status;
    }
  }
}

export const nodeRegistry = new NodeRegistry();
