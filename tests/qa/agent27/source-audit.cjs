// Static source/route consistency only; not browser or end-to-end certification.
// Run from the repository root: node tests/qa/agent27/source-audit.cjs
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = process.cwd();
function walk(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]); }
const files = walk(path.join(root,'src')).filter(f=>/\.tsx?$/.test(f)&&!f.endsWith('.d.ts'));
let syntaxErrors=[];
for (const file of files) {
 const sf=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
 for(const d of sf.parseDiagnostics) syntaxErrors.push({file:path.relative(root,file),line:sf.getLineAndCharacterOfPosition(d.start).line+1,message:ts.flattenDiagnosticMessageText(d.messageText,' ')});
}
const sf=ts.createSourceFile('src/routes.tsx',fs.readFileSync('src/routes.tsx','utf8'),ts.ScriptTarget.Latest,true);
const routes=[],imports=[];
function visit(n) {
 if(ts.isPropertyAssignment(n)&&n.name.getText(sf)==='path'&&ts.isStringLiteral(n.initializer)) routes.push(n.initializer.text);
 if(ts.isImportDeclaration(n)&&n.moduleSpecifier.text.startsWith('.')) imports.push(n.moduleSpecifier.text);
 if(ts.isCallExpression(n)&&n.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(n.arguments[0])) imports.push(n.arguments[0].text);
 ts.forEachChild(n,visit);
}visit(sf);
function resolves(s){const b=path.resolve('src',s);return ['', '.ts','.tsx','.js','.jsx','/index.ts','/index.tsx'].some(e=>fs.existsSync(b+e)&&fs.statSync(b+e).isFile());}
function matches(p){p=p.split(/[?#]/)[0];return routes.filter(r=>r!=='*'&&r!=='/games/:legacyGame').some(r=>new RegExp('^'+r.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/:[^/]+/g,'[^/]+')+'/?$').test(p));}
const duplicateRoutes=routes.filter((r,i)=>routes.indexOf(r)!==i), missingImports=imports.filter(i=>!resolves(i));
const names=['src/pages/ApprovedArtworkPage.tsx','src/pages/FeatureHubPage.tsx','src/pages/ReadingPage.tsx','src/lib/island-adventures.ts'];
const links=[];
for(const file of names) {
 const text=fs.readFileSync(file,'utf8');
 const parsed=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);
 function walk(n){if(ts.isStringLiteral(n)&&/^\/(?!assets|api)[a-z\d/?-]/i.test(n.text)&&!n.text.startsWith('//'))links.push({file,path:n.text,registered:matches(n.text)});ts.forEachChild(n,walk);}walk(parsed);
}
const summary={typescriptFilesParsed:files.length,syntaxErrors,routeCount:routes.length,duplicateRoutes,routeImportsChecked:imports.length,missingImports,menuLinksChecked:links.length,unresolvedMenuLinks:links.filter(l=>!l.registered),routes};
console.log(JSON.stringify(summary,null,2));
if(syntaxErrors.length||duplicateRoutes.length||missingImports.length||summary.unresolvedMenuLinks.length)process.exitCode=1;
