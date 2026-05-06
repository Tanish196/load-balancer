import crypto from 'crypto';
import { ServerNode, VirtualNode } from '../types/index.js';
import { config } from '../config/index.js';

export class ConsistentHashingBalancer {
  private ring: number[] = [];
  private ringMap: Map<number, VirtualNode> = new Map();

  public hash(key: string): number {
    const hashHex = crypto.createHash('sha256').update(key).digest('hex');
    return parseInt(hashHex.substring(0, 8), 16) & 0x7fffffff;
  }

  public addNode(node: ServerNode): void {
    const vNodeCount = config.virtualNodeCount * (node.weight || 1);

    for (let i = 0; i < vNodeCount; i++) {
      const vNodeId = `${node.id}-v${i}`;
      const hashValue = this.hash(vNodeId);

      const virtualNode: VirtualNode = {
        hash: hashValue,
        virtualNodeId: vNodeId,
        physicalNodeId: node.id,
      };

      this.ringMap.set(hashValue, virtualNode);
      this.ring.push(hashValue);
    }

    this.rebuildSortedRing();
  }

  public removeNode(nodeId: string): void {
    const hashesToRemove: number[] = [];

    for (const [hash, vNode] of this.ringMap.entries()) {
      if (vNode.physicalNodeId === nodeId) {
        hashesToRemove.push(hash);
      }
    }

    for (const hash of hashesToRemove) {
      this.ringMap.delete(hash);
    }

    this.ring = this.ring.filter((hash) => !hashesToRemove.includes(hash));
    this.rebuildSortedRing();
  }

  public initialize(nodes: ServerNode[]): void {
    this.ring = [];
    this.ringMap.clear();

    const healthyNodes = nodes.filter((n) => n.status === 'healthy');
    for (const node of healthyNodes) {
      this.addNode(node);
    }
  }

  private rebuildSortedRing(): void {
    this.ring.sort((a, b) => a - b);
  }

  public getNodeForIP(ip: string): VirtualNode {
    if (this.ring.length === 0) {
      throw new Error('503: Service Unavailable. Hash ring is empty.');
    }

    const ipHash = this.hash(ip);
    const targetHash = this.findNearestNode(ipHash);
    
    const vNode = this.ringMap.get(targetHash);
    if (!vNode) {
      throw new Error('CRITICAL ERROR: Hash found in ring but missing from map.');
    }

    return vNode;
  }

  private findNearestNode(hash: number): number {
    let low = 0;
    let high = this.ring.length - 1;

    if (hash > this.ring[high]) {
      return this.ring[0];
    }

    let resultIndex = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);

      if (this.ring[mid] >= hash) {
        resultIndex = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return this.ring[resultIndex];
  }

  public getRingData(): VirtualNode[] {
    return this.ring.map((hash) => this.ringMap.get(hash) as VirtualNode);
  }
}

export const consistentHashingBalancer = new ConsistentHashingBalancer();