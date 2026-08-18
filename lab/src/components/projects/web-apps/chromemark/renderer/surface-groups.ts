import {
  BufferAttribute,
  BufferGeometry,
  type ExtrudeGeometry,
} from "three";

type SurfaceSplit = {
  lids: BufferGeometry;
  shell: BufferGeometry | null;
};

function copyRange(
  source: BufferGeometry,
  start: number,
  count: number,
): BufferGeometry {
  const dest = new BufferGeometry();
  for (const name of Object.keys(source.attributes)) {
    const attr = source.getAttribute(name);
    const itemSize = attr.itemSize;
    const sliced = attr.array.slice(
      start * itemSize,
      (start + count) * itemSize,
    );
    dest.setAttribute(
      name,
      new BufferAttribute(sliced, itemSize, attr.normalized),
    );
  }
  return dest;
}

function remapVertices(source: BufferGeometry, order: number[]): BufferGeometry {
  const dest = new BufferGeometry();
  for (const name of Object.keys(source.attributes)) {
    const attr = source.getAttribute(name);
    const itemSize = attr.itemSize;
    const src = attr.array;
    const out = new Float32Array(order.length * itemSize);
    for (let i = 0; i < order.length; i++) {
      const from = order[i]! * itemSize;
      const to = i * itemSize;
      for (let k = 0; k < itemSize; k++) {
        out[to + k] = Number(src[from + k]);
      }
    }
    dest.setAttribute(
      name,
      new BufferAttribute(out, itemSize, attr.normalized),
    );
  }
  return dest;
}

export function flattenLidNormals(geometry: BufferGeometry): void {
  const pos = geometry.getAttribute("position");
  let nrm = geometry.getAttribute("normal");
  if (!pos) return;
  if (!nrm) {
    geometry.computeVertexNormals();
    nrm = geometry.getAttribute("normal");
  }
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const mid = (minZ + maxZ) * 0.5;
  for (let i = 0; i < pos.count; i++) {
    const sign = pos.getZ(i) <= mid ? -1 : 1;
    nrm.setXYZ(i, 0, 0, sign);
  }
  nrm.needsUpdate = true;
}

export function splitExtrudeSurfaces(
  extruded: ExtrudeGeometry,
  options: { bevelEnabled: boolean; bevelSegments: number; steps: number },
): SurfaceSplit {
  const lidGroup = extruded.groups.find((group) => group.materialIndex === 0);
  const shellGroup = extruded.groups.find((group) => group.materialIndex === 1);
  const total = extruded.getAttribute("position")?.count ?? 0;

  const lidStart = lidGroup?.start ?? 0;
  const lidCount = lidGroup?.count ?? total;
  const lids = copyRange(extruded, lidStart, lidCount);
  flattenLidNormals(lids);

  if (!shellGroup || shellGroup.count < 6) {
    return { lids, shell: null };
  }

  let shell = copyRange(extruded, shellGroup.start, shellGroup.count);
  const bevelSegments = options.bevelEnabled ? options.bevelSegments : 0;
  const steps = Math.max(1, options.steps);
  const layers = steps + bevelSegments * 2;
  const quadVerts = 6;
  const quads = shell.getAttribute("position").count / quadVerts;
  const canSplit =
    bevelSegments > 0 &&
    Number.isInteger(quads) &&
    quads > 0 &&
    quads % layers === 0;

  if (canSplit) {
    const edges = quads / layers;
    const bevelOrder: number[] = [];
    const wallOrder: number[] = [];
    for (let edge = 0; edge < edges; edge++) {
      for (let layer = 0; layer < layers; layer++) {
        const base = (edge * layers + layer) * quadVerts;
        const isWall = layer >= bevelSegments && layer < bevelSegments + steps;
        const dest = isWall ? wallOrder : bevelOrder;
        for (let v = 0; v < quadVerts; v++) dest.push(base + v);
      }
    }
    const ordered = remapVertices(shell, bevelOrder.concat(wallOrder));
    shell.dispose();
    shell = ordered;
    shell.clearGroups();
    shell.addGroup(0, bevelOrder.length, 0);
    shell.addGroup(bevelOrder.length, wallOrder.length, 1);
  } else {
    shell.clearGroups();
    shell.addGroup(0, shell.getAttribute("position").count, 1);
  }

  return { lids, shell };
}
