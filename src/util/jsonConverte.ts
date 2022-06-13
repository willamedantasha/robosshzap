import fs from 'fs'

export const readJSON = (pathFileJson: String) => {
    // @ts-ignore
    return JSON.parse(fs.readFileSync(pathFileJson, 'utf-8'));
};

export const writeJSON = (pathFileJson: string, data: object) => {
    fs.writeFileSync(pathFileJson, JSON.stringify(data));
};