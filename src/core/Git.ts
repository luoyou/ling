import * as vscode from "vscode";
import { GitExtension } from "../types/git";
import { getProjectPath } from "../tool/function";

export default async (textEditor: vscode.TextEditor) => {
  const git =
    vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
  if (!git?.enabled) {
    vscode.window.showErrorMessage("git扩展未启用，无法使用此快捷模式");
    return false;
  }

  const quickPick = vscode.window.createQuickPick();
  quickPick.placeholder = "Type to filter options";
  quickPick.items = await getItems();
  quickPick.matchOnDescription = true;
  quickPick.matchOnDetail = true;
  // quickPick.onDidChangeValue(async (value) => {
  //   quickPick.items = await getItems(value);
  // });
  quickPick.onDidChangeSelection(([item]) => {
    if (item) {
      vscode.window.showInformationMessage(`You selected ${item.label}`);
    } else {
      const userInput = quickPick.value;
      vscode.window.showInformationMessage(`You entered ${userInput}`);
    }
    quickPick.hide();
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();

  // const repo = git.getAPI(1).repositories.find((repo) => {
  //   return repo.rootUri.fsPath === getProjectPath(textEditor.document);
  // });

  // const commitMsg = await repo?.log({maxEntries: 16});
  // console.log('commitMsg: ', commitMsg?commitMsg[0].message:'');

  // if(repo){
  //   repo.inputBox.value = '测试提交';
  // }

  // repo?.commit("测试提交", { all: true }).then(() => repo?.push());
};

async function getItems(
  filterText: string = ""
): Promise<vscode.QuickPickItem[]> {
  const allItems = [
    { label: "Option 1", description: "This is the first option" },
    { label: "Option 2", description: "This is the second option" },
    { label: "Option 3", description: "This is the third option" },
    { label: "Option 4", description: "This is the fourth option" },
    { label: "Option 5", description: "This is the fifth option" },
  ];
  const filteredItems = allItems.filter((item) =>
    `${item.label} ${item.description}`
      .toLowerCase()
      .includes(filterText.toLowerCase())
  );
  // if(filteredItems.length === 0){
  //   filteredItems.push({label: filterText, description: "自动生成"});
  // }
  return filteredItems;
}
