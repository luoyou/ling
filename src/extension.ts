// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('ling.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from ling!');
	});

	context.subscriptions.push(disposable);

	/** 按住ctrl 识别php中的string类的字符串支持跳转 */
	let stringClass = vscode.languages.registerDefinitionProvider(['php'], {provideDefinition})
	context.subscriptions.push(stringClass)

	// let endSemicolon = vscode.commands.registerTextEditorCommand('ling.end', {

	// })

}

// This method is called when your extension is deactivated
export function deactivate() {}


/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
function provideDefinition(
	document: vscode.TextDocument, 
	position: vscode.Position, 
	token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition | vscode.DefinitionLink[]>{

	const fileName	= document.fileName;
	const namespace = document.getText(document.getWordRangeAtPosition(position, /('(\\?(\w+\\\w+)+)')|(\"(\\?(\w+\\\w+)+)\")/));
	const line		= document.lineAt(position);

	if (fileName.endsWith('.php') && /('(\\?(\w+\\\w+)+)')|(\"(\\?(\w+\\\w+)+)\")/.test(line.text)) {
		let projectPath = getProjectPath(document)
		let destPath = projectPath + '/' + namespace.replaceAll('\\', '/').replaceAll('"', '').replaceAll("'", '')+'.php'
		const fs = require('fs');
		if (fs.existsSync(destPath)) {
			// new vscode.Position(0, 0) 表示跳转到某个文件的第一行第一列
			return new vscode.Location(vscode.Uri.file(destPath), new vscode.Position(0, 0))
		}
	}
}

    /**
     * 获取当前所在工程根目录，有3种使用方法：<br>
     * getProjectPath(uri) uri 表示工程内某个文件的路径<br>
     * getProjectPath(document) document 表示当前被打开的文件document对象<br>
     * getProjectPath() 会自动从 activeTextEditor 拿document对象，如果没有拿到则报错
     * @param {*} document 
     */
function getProjectPath(document: vscode.TextDocument):string {
	let projectPath = ''
	if(vscode.workspace.workspaceFolders === undefined) {
		return projectPath
	}
	vscode.workspace.workspaceFolders.forEach(folder => {
		if(document.uri.fsPath.indexOf(folder.uri.fsPath) === 0) {
			projectPath = folder.uri.fsPath
		}
	})

	return projectPath;
}