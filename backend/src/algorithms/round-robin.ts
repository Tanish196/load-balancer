import { ServerNode } from '../types/index.js';

export class RoundRobinBalancer {
  private currentIndex = 0;

  public getNextNode(nodes: ServerNode[]): ServerNode {
    if (nodes.length === 0) {
      throw new Error('No healthy nodes available to handle the request.');
    }

    const node = nodes[this.currentIndex];

    this.currentIndex = (this.currentIndex + 1) % nodes.length;

    return node;
  }
}

export const roundRobinBalancer = new RoundRobinBalancer();
