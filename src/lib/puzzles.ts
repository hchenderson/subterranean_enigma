import { ArchiveIcon } from "@/components/icons/ArchiveIcon";
import { NetworkIcon } from "@/components/icons/NetworkIcon";
import { WellIcon } from "@/components/icons/WellIcon";
import type { RoomId } from "./types";

export const PUZZLE_DATA = {
  archive: [
    { id: 1, title: 'Fragmented Timestamps', description: 'Reassemble chronological log events from partial timestamps.'},
    { id: 2, title: 'Contradiction Matrix', description: 'Identify the single false statement based on earlier clues.'},
    { id: 3, title: 'Missing Logline', description: 'Construct or select a logline that meets given constraints.'},
    { id: 4, title: 'Echo Loop Reconstruction', description: 'Detect a duplicated but mutated log entry and arrange the remaining logs.'},
    { id: 5, title: 'Sector Lock', description: 'Decode a set of research tags using prior timeline clues.'},
  ],
  well: [
    { id: 1, title: 'Pulse Pattern Recognition', description: 'Interpret repeating thrum/pause sequences as binary numeric patterns.'},
    { id: 2, title: 'Rotating Sigils', description: 'Identify the nth symbol in a mechanically repeating sigil cycle.'},
    { id: 3, title: 'Valve Alignment Grid', description: 'Solve a 3x3 constraint-based valve alignment puzzle.'},
    { id: 4, title: 'Steam Rhythm Translation', description: 'Translate steam bursts (short/long patterns) into sequences.'},
    { id: 5, title: 'Regulator Stabilization', description: 'Balance P, H, and R variables under strict constraints.'},
  ],
  network: [
    { id: 1, title: 'Cipher Cascade', description: 'A warm-up with a simplified bulls/cows cipher.'},
    { id: 2, title: 'Glitch Routing', description: 'Route data across nodes, avoiding the red herring.'},
    { id: 3, title: 'False Positive Filter', description: 'Identify misleading logs by cross-referencing facts.'},
    { id: 4, title: 'Multi-layer Cipher', description: 'Combine timeline, rhythm, and cipher mechanics.'},
    { id: 5, title: 'Identity Hash Extraction', description: 'A 6-digit cipher where AURELIA occasionally lies.'},
  ],
};

export const ROOMS: Record<RoomId, {
    id: RoomId;
    name: string;
    description: string;
    theme: string;
    icon: React.ComponentType<{ className?: string }>;
    keyName: string;
}> = {
    archive: {
        id: 'archive',
        name: 'Archive of Echoes',
        description: 'Delve into fragmented memories and reconstruct timelines.',
        theme: 'Memory, Timelines, Contradictions',
        icon: ArchiveIcon,
        keyName: 'Echospire'
    },
    well: {
        id: 'well',
        name: 'The Mechanical Well',
        description: 'Solve puzzles of rhythm, pressure, and spatial logic.',
        theme: 'Industry, Rhythm, Spatial Puzzles',
        icon: WellIcon,
        keyName: 'Pulsar-Lineage'
    },
    network: {
        id: 'network',
        name: 'The Shrouded Network',
        description: 'Navigate digital labyrinths of code and misinformation.',
        theme: 'Glitches, Codebreaking, Deception',
        icon: NetworkIcon,
        keyName: 'Aurelion-Prime'
    }
};
