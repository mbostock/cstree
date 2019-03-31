import {csvParseRows} from "d3-dsv";

export function cstParse(text, row = object => object) {
  const lines = text.trim().split(/^/gm);
  const [columns] = csvParseRows(lines.shift());
  const object = objectConverter(columns);
  return cstParseLines(lines, (array, i) => row(object(array), i));
}

export function cstParseRows(text, row = array => array) {
  return cstParseLines(text.trim().split(/^/gm), row);
}

function cstParseLines(lines, row) {
  const parents = [];
  let index = -1;
  parents.push({children: []});
  for (let line of lines) {
    const depth = line.match(/^\s*/)[0].length;
    if (depth === line.length) continue; // Skip empty rows.
    line = line.slice(depth); // Trim indentation.
    const value = row(csvParseRows(line)[0], ++index);
    if (value == null) continue; // Filter.
    let parent;
    for (let i = depth; !(parent = parents[i]); --i); // Search for parent.
    if (!parent.children) parent.children = [];
    parent.children.push(parents[depth + 1] = value);
  }
  return parents[0].children.length === 1 ? parents[0].children[0] : parents[0];
}

function objectConverter(columns) {
  return new Function("d", `return {${columns.map((name, i) => {
    return `${JSON.stringify(name)}: d[${i}]`;
  }).join()}}`);
}
