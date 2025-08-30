function mapUser(u) {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    avatarUrl: u.avatarUrl || null,
    roleId: u.roleId ?? null,
    roleName: u.role?.name ?? null, // eğer include ile Role join edildiyse
    isActive: u.isActive,
    managerId: u.managerId ?? null,
    createdAt: u.createdAt?.toISOString?.() ?? null,
  };
}

/**
 * roots: managerId'i null olan kullanıcılar (veya başlangıç düğümleri)
 * childrenMap: key = managerId, value = o manager'ın doğrudan raporları listesi
 * depth: sayı (0,1,2,...) veya 'all'
 */
function buildTree(roots, childrenMap, depth = 1) {
  const toNode = (u, currentDepth) => {
    const node = mapUser(u);
    const kids = childrenMap.get(u.id) || [];
    const canGoDeeper = depth === 'all' || currentDepth < depth;
    if (canGoDeeper && kids.length) {
      node.children = kids.map(c => toNode(c, currentDepth + 1));
    }
    return node;
  };
  return roots.map(r => toNode(r, 0));
}

module.exports = { buildTree, mapUser };
