import * as vscode from 'vscode'

const symbol_map:any = {
    ')': '(',
    ']': '[',
    '}': '{'
}
/**
 * 后续该方法需要变更为，读取单个字符，然后智能判断补全位置，目前仅能在尾部进行补全
 */
export default (symbol: string)=>{
    return (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        let line = textEditor.document.lineAt(textEditor.selection.end.line)
        let leftNum = line.text.split(symbol_map[symbol]).length - 1;
        if(leftNum > 0){
            let rightNum = line.text.split(symbol).length - 1;
            if(rightNum < leftNum){
                vscode.commands.executeCommand('cursorLineEnd')
                if(line.text.endsWith(';')){
                    vscode.commands.executeCommand('cursorLeft')
                }
                vscode.commands.executeCommand('type', {text:symbol})
            }
        }
    }
}