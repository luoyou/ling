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

  vscode.window
    .showQuickPick(["选项1", "选项2", "3"], { title: "提交信息" })
    .then((val) => {
      console.log(val);
    });

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
