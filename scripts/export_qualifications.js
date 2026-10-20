// Read the same data used in the browser, without initialising the UI.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({window:{},document:{getElementById(){return null;}}});
for(const name of ['exam-dates.js','qualification-sources.js','qualification-pages.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets',name),'utf8'),context);
const diagnosis=context.window.QualificationDiagnosis;
process.stdout.write(JSON.stringify({qualifications:diagnosis.qualifications,schedules:context.window.EXAM_SCHEDULES,sources:context.window.QUALIFICATION_SOURCES,directoryHTML:diagnosis.directoryMarkup(diagnosis.qualifications)}));
