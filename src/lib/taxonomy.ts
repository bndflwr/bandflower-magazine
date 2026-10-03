// Schema and logic for tag taxonomy. Actual content data lives in src/data/taxonomy.ts.

export type TaxonomyNode = {
  defaultOpen?: boolean;
  tags?: string[]; // Leaf tags directly belonging to this level
  groups?: Record<string, TaxonomyNode>; // Subgroups
};

export type Taxonomy = Record<string, TaxonomyNode>;

// Recursively collect all leaf tags and subgroup names under a node.
// Group names are also treated as "implicit tags": an article that directly
// attaches to a group name (e.g. "Windows") means "belongs directly to that
// group, not yet subdivided", so group pages and counts must both include it.
export function getAllLeafTags(node: TaxonomyNode): string[] {
  const tags: string[] = [...(node.tags ?? [])];
  for (const [childName, child] of Object.entries(node.groups ?? {})) {
    tags.push(childName, ...getAllLeafTags(child));
  }
  return tags;
}

// Get a Set of all group names (including nested) in the taxonomy.
// Only used internally by getOrphanTags in this file, so it is not exported.
function getAllGroupNames(taxonomy: Taxonomy): Set<string> {
  const names = new Set<string>();
  function walk(groups: Record<string, TaxonomyNode> | undefined) {
    for (const [name, node] of Object.entries(groups ?? {})) {
      names.add(name);
      walk(node.groups);
    }
  }
  walk(taxonomy);
  return names;
}

// Tag name → URL slug.
// Spaces, slashes, and other punctuation are all collapsed into hyphens
// (letters/numbers including CJK are preserved), keeping the rule
// "one name = one URL segment": toSlug("KVM/QEMU") === "kvm-qemu",
// toSlug("磁碟管理(mmc)") === "磁碟管理-mmc".
// Note: changing this rule = changing every tag URL site-wide; old paths
// must be redirected via redirects in astro.config.mjs.
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

// Orphan tags = article tags not in the taxonomy (neither leaf tags nor
// group names = implicit tags). The "Uncategorized" section of the tags tree
// page and the auto-generated leaf pages in [...path].astro share this definition.
export function getOrphanTags(
  taxonomy: Taxonomy,
  allTags: Iterable<string>,
): string[] {
  const taxonomyTags = getAllTaxonomyTags(taxonomy);
  const groupNames = getAllGroupNames(taxonomy);
  return [...allTags].filter((t) => !taxonomyTags.has(t) && !groupNames.has(t));
}

// Get a Set of all leaf-node tags in the taxonomy
export function getAllTaxonomyTags(taxonomy: Taxonomy): Set<string> {
  const all = new Set<string>();
  function walk(node: TaxonomyNode) {
    for (const tag of node.tags ?? []) all.add(tag);
    for (const child of Object.values(node.groups ?? {})) walk(child);
  }
  for (const node of Object.values(taxonomy)) walk(node);
  return all;
}
