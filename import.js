const fs = require("fs");
const { createArrayCsvWriter } = require("csv-writer");
const { parseArgs } = require("node:util");

// parse arguments -i and -o using parseArgs
const options = {
  i: {
    type: "string",
    short: "i",
  },
  o: {
    type: "string",
    short: "o",
  },
};

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options,
});

const inputFilePath = values.i;
const outputFilePath = values.o;

// Set up the CSV writer with the columns you want to capture
const csvWriter = createArrayCsvWriter({
  path: outputFilePath,
  header: [],
});

const line1Regexp =
  /^\s+([1])\s+([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)\s*$/;
const midRegexp = /^\s+([\d,.]+)\s+([\d,.]+|und mehr)\s*$/;
const line2Regexp =
  /^\s+([2])\s+([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)\s*$/;

// Read the input file
console.log(`Reading txt file: ${inputFilePath}`);
fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
    return;
  }

  const records = [];

  // Split the file content by lines and process each line
  const lines = data.split("\n");
  let mid = [];
  let group = [];
  lines.forEach((line) => {
    const line1Match = line.match(line1Regexp);
    const midMatch = line.match(midRegexp);
    const line2Match = line.match(line2Regexp);
    if (line1Match) {
      const [_, groupNumber, ...rest] = line1Match;
      group.push([toInt(groupNumber), ...rest.map(toFloat)]);
    } else if (midMatch) {
      const [_, von, bis] = midMatch;
      mid = [toFloat(von), toFloat(bis)];
    } else if (line2Match) {
      const [_, groupNumber, ...rest] = line2Match;
      group.push([toInt(groupNumber), ...rest.map(toFloat)]);
    }
    if (group.length == 2) {
      records.push([...mid, ...group[0]]);
      records.push([...mid, ...group[1]]);
      group = [];
      mid = [];
    }
  });

  // Write the parsed data to CSV
  csvWriter
    .writeRecords(records)
    .then(() => console.log(`CSV file created successfully: ${outputFilePath}`))
    .catch((err) => console.error(`Error writing CSV file: ${err}`));
});

function toFloat(v) {
  const r = parseFloat(v.replace(".", "").replace(",", "."));
  if (isNaN(r)) {
    return v;
  }
  return r;
}

function toInt(v) {
  const r = parseInt(v);
  if (isNaN(r)) {
    return v;
  }
  return r;
}
