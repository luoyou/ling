/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import symbolComplete from './core/SymbolComplete';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	/** 按住ctrl 识别php中的string类的字符串支持跳转 */
	let stringClass = vscode.languages.registerDefinitionProvider(['php'], {provideDefinition});
	context.subscriptions.push(stringClass);

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.endSemicolon',    shortcutRule(';', false)));
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.preEndSemicolon', shortcutRule(';', true)));

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.endComma',    shortcutRule(',', false)));
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.preEndComma', shortcutRule(',', true)));

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.endColon', shortcutRule(':', false)));
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.endQuestionMark', shortcutRule('?', false)));

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.endEqual', shortcutRule(' = ', false)));

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.endDoubleArrow', shortcutRule(' => ', false)));
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.endArrow', shortcutRule('->', false)));

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.endBraces', shortcutRule('{', false)));
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.endSquareBraces', shortcutRule('[', false)));
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.endParentheses', shortcutRule('(', false)));
	
	// 智能补全右圆括号
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.completeBraces', symbolComplete('}')));
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.completeSquareBraces', symbolComplete(']')));
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('ling.completeParentHeses', symbolComplete(')')));

	// context.subscriptions.push(vscode.languages.registerCompletionItemProvider('php', {
	// 	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): ProviderResult<T[] | CompletionList<T>> {
	// 		let file_name = document.fileName;

	// 	},
	// }, '<?'));

	context.subscriptions.push(vscode.commands.registerCommand("ling.gitFlow", () => {
    vscode.commands.executeCommand("git.commitAll").then(() => {
      vscode.commands.executeCommand("git.push");
    });
  }));
}

// This method is called when your extension is deactivated
export function deactivate() {}

/** 在行尾插入这些符号时，遇到相应的符号会自动前移 */
const 前移符号: { [key: string]: { [key: string]: string[] } } = {
  "(": {
    "*": [" ", ";", "{", "}"],
  },
  ")": {
    "*": [" ", ";", "{"],
  },
  "[": {
    "*": [" ", ";"],
  },
  "]": {
    "*": [" ", ";"],
  },
  "{": {
    "*": [" ", ";"],
  },
  "}": {
    "*": [" ", ";"],
  },
  "?": {
    "*": [" ", ";", ","],
  },
  ":": {
    "*": [" ", ";", ",", "{"],
  },
  "->": {
    "*": [" ", ";", ",", "{", "}", "'", '"'],
  },
  "=>": {
    "*": [" ", ";", ",", "{", "}"],
  },
};

function shortcutRule(symbol: string, ctrl = false){
	return (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
		symbol = 根据语言获得映射符号(symbol, textEditor.document.languageId);
		let line = textEditor.document.lineAt(textEditor.selection.end.line);
		vscode.commands.executeCommand('cursorLineEnd');
		let text = line.text;
		if(symbol in 前移符号){
			let 符号列表 = 根据语言获取前移符号列表(symbol, textEditor.document.languageId);
			符号列表.map(item => {
				while(text.endsWith(item)){
					vscode.commands.executeCommand('cursorLeft');
					text = text.slice(0, -item.length);
				}
			});
		}
		if(!text.endsWith(symbol)){ // 当行尾已经是此符号时，仅移至行尾，不进行字符输入
			vscode.commands.executeCommand('type', {text: symbol});
		}
		if(ctrl){
			vscode.commands.executeCommand('cursorLeft', symbol.length);
		}
	};
}

const symbol_map: { [key: string]: { [key: string]: string } } = {
  "->": {
    php: "->",
    "*": ".",
  },
};

/**
 * 不同语言中的表示相同功能的符号并不一致，此处会根据映射表，自动根据语言进行符号转换
 * @param symbol 
 * @param languageId 
 * @returns 
 */
function 根据语言获得映射符号(symbol: string, languageId: string){
	if(symbol in symbol_map && (languageId in symbol_map[symbol] || '*' in symbol_map[symbol])){
		return symbol_map[symbol][languageId]??symbol_map[symbol]['*'];
	}else{
		return symbol;
	}
}

function 根据语言获取前移符号列表(符号: string, 语言: string){
	if(符号 in 前移符号 && (语言 in 前移符号[符号] || '*' in 前移符号[符号])){
		return 前移符号[符号][语言]??前移符号[符号]['*'];
	}else{
		return [];
	}
}

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

	const regex = /('(\\?(\w+\\\w+)+)')|(\"(\\?(\w+\\\w+)+)\")/;
	const fileName	= document.fileName;
	const line		= document.lineAt(position);
	
	if (fileName.endsWith('.php') && regex.test(line.text)) {
		const namespace = document.getText(document.getWordRangeAtPosition(position, regex));
		let projectPath = getProjectPath(document);
		let destPath = projectPath + '/' + namespace.replaceAll('\\', '/').replaceAll('"', '').replaceAll("'", '')+'.php';
		const fs = require('fs');
		if (fs.existsSync(destPath)) {
			return new vscode.Location(vscode.Uri.file(destPath), new vscode.Position(0, 0));
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
	let projectPath = '';
	if(vscode.workspace.workspaceFolders === undefined) {
		return projectPath;
	}
	vscode.workspace.workspaceFolders.forEach(folder => {
		if(document.uri.fsPath.indexOf(folder.uri.fsPath) === 0) {
			projectPath = folder.uri.fsPath;
		}
	});

	return projectPath;
}