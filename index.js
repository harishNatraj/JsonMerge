const fs = require("fs");
const deepmerge = require("deepmerge");

//const dirname = "/Users/harishnatraj/Desktop/jsonmerge/jsons/";
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

readline.question(`Enter path:`, (name) => {
  const dirname=name;
  readline.close()
})
//Directory where merged files are being stored
const outputDir = "result/";
const numCheckRegEx = /(\d+)(?!.*\d)/;

// Merge items. Send array of objects to the function
const mergeItems = jsonArr => {
  const result = deepmerge(...jsonArr, {
    arrayMerge: (destination, source) => {
      return [...destination, ...source];
    }
  });
  return result;
};

//Function to read files in the directory.Works asynchronously.
function getDirectoryPrefixes(callback) {
  const prefixes = {};

  fs.readdir(dirname, (err, files) => {
    files.forEach(fileName => {
      const prefix = getPrefix(fileName);
      if (prefix) {
        if (!prefixes[prefix]) {
          prefixes[prefix] = [];
        }
        prefixes[prefix].push(fileName);
      }
    });

    callback(prefixes);
  });

//To find the prefix of the files present.
  const getPrefix = name => {
    const fileName = name.split(".")[0];
    const test = fileName.match(numCheckRegEx);
    if ((fileName, test[0])) {
      const prefix = fileName.replace(test[0], "");
      return prefix;
    }
    return "";
  };
}

const onPrefixGetComplete = prefixes => {
  const merges = {};
  Object.keys(prefixes).forEach(prefix => {
    const jsonArr = [];
    prefixes[prefix].forEach(file => {
      const data = fs.readFileSync(`${dirname}${file}`, "utf-8");
      try {
        const json = JSON.parse(data);
        jsonArr.push(json);
      } catch (ex) {}
    });
    const dataOnMerge = mergeItems(jsonArr);
    merges[prefix] = dataOnMerge;
  });

  writeMergeDataToFile(merges);
};

//To merge files with similar prefixes and write to directory.
const writeMergeDataToFile = mergeObj => {
  Object.keys(mergeObj).forEach((item, index) => {
      try {
          const fileData = JSON.stringify(mergeObj[item]);

          fs.writeFile(`${outputDir}merge${index + 1}.json`, fileData, err => {
            console.log(err);
          });
      } catch (ex) {}
  });
};

getDirectoryPrefixes(onPrefixGetComplete);
