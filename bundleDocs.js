import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to read all files in a directory recursively
function readFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            readFiles(filePath, fileList);
        } else {
            fileList.push({
                path: filePath,
                content: fs.readFileSync(filePath, 'utf8')
            });
        }
    });
    return fileList;
}

// Read all files in the ./docs directory
const docs = readFiles('./docs');

// Convert the file list to a JSON object
const jsonDocs = {
    files: docs.map(file => ({
        path: file.path,
        content: file.content
    }))
};

// Write the JSON object to a file
fs.writeFileSync('./docs.json', JSON.stringify(jsonDocs, null, 2));

console.log('Documentation bundled into docs.json');