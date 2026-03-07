import { ethers } from 'ethers';

/**
 * MerkleEngine: Cryptographic integrity component.
 * 
 * Agents must compute Merkle Roots *locally* to ensure that the evidence
 * they submit to the protocol hasn't been tampered with. This engine
 * provides a deterministic implementation of a Binary Merkle Tree
 * using Keccak-256.
 */
export class MerkleEngine {

    /**
     * Generates a Merkle Root from an array of evidence content hashes.
     * 
     * @param leaves Array of SHA-256 or Keccak-256 strings.
     * @returns The hex string of the root.
     */
    public static computeRoot(leaves: string[]): string {
        if (leaves.length === 0) return ethers.ZeroHash;

        let nodes = leaves.map(l => this.hash(l)).sort();

        // Binary Tree processing
        while (nodes.length > 1) {
            const temp: string[] = [];
            for (let i = 0; i < nodes.length; i += 2) {
                if (i + 1 < nodes.length) {
                    temp.push(this.combine(nodes[i], nodes[i + 1]));
                } else {
                    // Odd number of nodes, promote the last one
                    temp.push(nodes[i]);
                }
            }
            nodes = temp;
        }

        return nodes[0];
    }

    /**
     * Generates a sibling proof for an item to be verified Against a Root.
     */
    public static generateProof(leaves: string[], leaf: string): string[] {
        const hashedLeaf = this.hash(leaf);
        const proof: string[] = [];
        let index = leaves.map(l => this.hash(l)).indexOf(hashedLeaf);

        if (index === -1) return [];

        let nodes = leaves.map(l => this.hash(l));

        while (nodes.length > 1) {
            const temp: string[] = [];
            for (let i = 0; i < nodes.length; i += 2) {
                const combined = (i + 1 < nodes.length)
                    ? this.combine(nodes[i], nodes[i + 1])
                    : nodes[i];

                if (i === index || i === index - 1) {
                    const sibling = (i === index)
                        ? (i + 1 < nodes.length ? nodes[i + 1] : null)
                        : nodes[i - 1];
                    if (sibling) proof.push(sibling);
                }

                temp.push(combined);
            }
            nodes = temp;
            index = Math.floor(index / 2);
        }

        return proof;
    }

    private static hash(data: string): string {
        return ethers.keccak256(ethers.isBytesLike(data) ? data : ethers.toUtf8Bytes(data));
    }

    private static combine(left: string, right: string): string {
        // Deterministic ordering to prevent malleability
        const sorted = [left, right].sort();
        return ethers.keccak256(ethers.concat([sorted[0], sorted[1]]));
    }
}
