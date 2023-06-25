import * as vscode from "vscode";
import { GitExtension } from "../types/git";

export default async (textEditor: vscode.TextEditor) => {
  const git =
    vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
  if (!git?.enabled) {
    vscode.window.showErrorMessage("git扩展未启用，无法使用此快捷模式");
    return false;
  }

  const repo = git
    .getAPI(1)
    .repositories.filter((repo) =>
      textEditor.document.uri.path.startsWith(repo.rootUri.path)
    )
    .sort((a, b) => b.rootUri.path.length - a.rootUri.path.length)[0];

  const commits: vscode.QuickPickItem[] =
    (await repo?.log({ maxEntries: 16 }))?.map((commit) => {
      return { label: commit.message, description: "最近提交信息" };
    }) ?? [];

  const quickPick = vscode.window.createQuickPick();
  quickPick.placeholder = "请输入提交信息";
  quickPick.title = "提交信息";
  quickPick.items = await getItems(commits);
  quickPick.onDidChangeValue(async (value) => {
    quickPick.items = await getItems(commits, value);
  });
  quickPick.onDidChangeSelection(([item]) => {
    repo
      ?.commit(item.label, { all: true })
      .then(() => vscode.commands.executeCommand("git.push"));
    quickPick.hide();
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
};

async function getItems(
  commits: vscode.QuickPickItem[] = [],
  filterText: string = ""
): Promise<vscode.QuickPickItem[]> {
  let history: string[] = [];
  const filteredItems = commits.filter((item, index) => {
    !history.includes(item.label) && // 去重
      item.label.toLowerCase().includes(filterText.toLowerCase()) && // 过滤
      item.label.toLowerCase() !== filterText.toLowerCase() &&
      !item.label.toLowerCase().startsWith("merge ");
    history.push(item.label);
  });
  filterText !== "" &&
    filteredItems.unshift({ label: filterText, description: "当前输入" });
  filteredItems.push({ label: "线上调试", description: "常用标签" });
  return filteredItems;
}
