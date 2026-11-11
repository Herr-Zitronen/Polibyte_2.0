// L1 (WOR-85): marcadores del contenido de ejemplo que no pueden llegar a producción.
export interface SourceFile {
  path: string;
  text: string;
}

export interface Placeholder {
  path: string;
  line: number;
  marker: string;
}

const MARKERS: { marker: string; re: RegExp }[] = [
  { marker: '[Contenido de ejemplo]', re: /\[Contenido de ejemplo\]/ },
  { marker: '[Nombre', re: /\[Nombre/ },
  { marker: '[Proyecto', re: /\[Proyecto/ },
  { marker: 'example.com', re: /\bexample\.com\b/ },
  // El enlace del formulario sin ruta (el valor por defecto de site.json).
  { marker: 'forms.office.com/ sin ruta', re: /forms\.office\.com\/?(?=["'\s]|$)/ },
];

/** Una entrada por línea y marcador encontrados, en el orden de los archivos. */
export function findPlaceholders(files: SourceFile[]): Placeholder[] {
  const out: Placeholder[] = [];
  for (const f of files)
    f.text.split(/\r?\n/).forEach((text, i) => {
      for (const { marker, re } of MARKERS) if (re.test(text)) out.push({ path: f.path, line: i + 1, marker });
    });
  return out;
}
