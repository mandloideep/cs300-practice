// The editor's file tree of src/editor/FileTree.jsx, for specs that open a file or check which
// one is open: a workspace file is a treeitem whose data-path is its workspace path.

export function fileNode(page, path) {
  return page.locator(`.pane--editor [role="treeitem"][data-path="${path}"]`);
}

export async function openFile(page, path) {
  await fileNode(page, path).click();
}

export function workspaceNodes(page) {
  return page.locator('.pane--editor [role="treeitem"][data-source="workspace"]');
}
