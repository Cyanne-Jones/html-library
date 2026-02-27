import fs from 'node:fs';
import path from 'node:path';

export interface PrototypeFile {
  name: string;
  slug: string;
  filename: string;
}

export interface PrototypeFolder {
  name: string;
  slug: string;
  files: PrototypeFile[];
}

export function getPrototypeTree(): PrototypeFolder[] {
  const prototypesDir = path.join(process.cwd(), 'public', 'prototypes');

  if (!fs.existsSync(prototypesDir)) {
    return [];
  }

  const folders = fs.readdirSync(prototypesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  return folders.map(folder => {
    const folderPath = path.join(prototypesDir, folder.name);
    const files = fs.readdirSync(folderPath)
      .filter(file => file.endsWith('.html'))
      .sort()
      .map(file => ({
        name: formatName(file.replace('.html', '')),
        slug: `${folder.name}/${file.replace('.html', '')}`,
        filename: file,
      }));

    return {
      name: formatName(folder.name),
      slug: folder.name,
      files,
    };
  }).filter(folder => folder.files.length > 0);
}

export function getAllPrototypePaths() {
  const tree = getPrototypeTree();
  return tree.flatMap(folder =>
    folder.files.map(file => ({
      params: { path: file.slug },
    }))
  );
}

export function formatName(slug: string): string {
  return slug
    .split('-')
    .map(word => {
      if (/^v\d+$/.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
