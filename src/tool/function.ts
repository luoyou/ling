import * as vscode from 'vscode';

/**
 * 获取当前所在工程根目录，有3种使用方法：<br>
 * getProjectPath(uri) uri 表示工程内某个文件的路径<br>
 * getProjectPath(document) document 表示当前被打开的文件document对象<br>
 * getProjectPath() 会自动从 activeTextEditor 拿document对象，如果没有拿到则报错
 * @param {*} document
 */
export function getProjectPath(document: vscode.TextDocument): string {
  let projectPath = "";
  if (vscode.workspace.workspaceFolders === undefined) {
    return projectPath;
  }
  vscode.workspace.workspaceFolders.forEach((folder) => {
    if (document.uri.fsPath.indexOf(folder.uri.fsPath) === 0) {
      projectPath = folder.uri.fsPath;
    }
  });

  return projectPath;
}
