import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

interface SearchResult {
  name: string;
  type: string;
  file: string;
  start_line: number;
  end_line: number;
  score: number;
}

interface SearchResponse {
  query?: string;
  elapsed_ms?: number;
  results?: SearchResult[];
  error?: string;
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('local-code-search.search', async () => {
    const query = await vscode.window.showInputBox({
      prompt: 'Search your codebase by meaning',
      placeHolder: 'e.g. how do I handle authentication'
    });

    if (!query) {
      return;
    }

    const config = vscode.workspace.getConfiguration('localCodeSearch');
    const pythonPath = config.get<string>('pythonPath', 'python');
    const mainScriptPath = config.get<string>('mainScriptPath', '');

    if (!mainScriptPath) {
      vscode.window.showErrorMessage(
        'Please set "localCodeSearch.mainScriptPath" in settings to point to your main.py file.'
      );
      return;
    }

    const projectRoot = path.dirname(path.dirname(mainScriptPath));

    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Searching...' },
      () => {
        return new Promise<void>((resolve) => {
          exec(
            `"${pythonPath}" "${mainScriptPath}" search "${query}" --json`,
            { cwd: projectRoot, maxBuffer: 1024 * 1024 },
            async (error, stdout, stderr) => {
              if (error) {
                vscode.window.showErrorMessage(`Search failed: ${stderr || error.message}`);
                resolve();
                return;
              }

              let parsed: SearchResponse;
              try {
                parsed = JSON.parse(stdout.trim().split('\n').pop() || '{}');
              } catch (e) {
                vscode.window.showErrorMessage('Could not parse search results.');
                resolve();
                return;
              }

              if (parsed.error === 'no_index') {
                vscode.window.showWarningMessage(
                  'No index found. Run "python main.py index <folder>" first.'
                );
                resolve();
                return;
              }

              if (!parsed.results || parsed.results.length === 0) {
                vscode.window.showInformationMessage('No results found.');
                resolve();
                return;
              }

              const items = parsed.results.map((r) => ({
                label: `${r.name}`,
                description: `${r.type} · score ${r.score.toFixed(3)}`,
                detail: `${r.file}:${r.start_line}`,
                result: r
              }));

              const picked = await vscode.window.showQuickPick(items, {
                placeHolder: `Results for "${query}"`
              });

              if (picked) {
                const doc = await vscode.workspace.openTextDocument(picked.result.file);
                const editor = await vscode.window.showTextDocument(doc);
                const line = Math.max(0, picked.result.start_line - 1);
                const range = new vscode.Range(line, 0, line, 0);
                editor.selection = new vscode.Selection(range.start, range.start);
                editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
              }

              resolve();
            }
          );
        });
      }
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}