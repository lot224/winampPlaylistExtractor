const fs = require('fs');
const path = require('path');
const readline = require('readline');

const cwd = process.cwd();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const files = [];

const songDirectory = 'songs';

const filterExtension = ".pls"; // ".json"

fs.readdirSync(cwd).forEach(file => {
  if (!filterExtension || file.endsWith(filterExtension)) {
    files.push(file);
  }
});

const killWords = ['quit', 'q', 'exit'];

let fn = {
  "showList": () => {
    let question = `What file do you wish to validate? 1-${files.length}\n\n`;

    for (let i = 0; i < files.length; i++) {
      question += `[${i + 1}] ${files[i]}\n`
    }
    question += '\n> ';

    fn.getFile(question);
  },

  "getFile": (question) => {
    rl.question(question, (input) => {
      input = input.toLowerCase();

      if (isNaN(input)) {
        if (killWords.indexOf(input) != -1) {
          console.log('bye.');
          rl.close();
        } else if (input === 'list') {
          fn.showList();
        } else if (input === 'help') {
          fn.showList();
        } else {
          fn.getFile(`Please enter a number (1 - ${files.length}) > `);
        }
      } else {
        let index = Number(input);

        if (input > 0 && input < files.length + 1) {
          fn.action(files[index - 1]);
          rl.close();
        } else {
          fn.getFile(`Invalid number, please enter a number (1 - ${files.length}) > `);
        }
      }
    })
  },
  "scrub": (value) => {
    /*
      < (less than)
      > (greater than)
      : (colon - sometimes works, but is actually NTFS Alternate Data Streams)
      " (double quote)
      / (forward slash)
      \ (backslash)
      | (vertical bar or pipe)
      ? (question mark)
      * (asterisk)
    */
    let invalidCharacters = /[\<\>\:\"\/\\\|\?\*]/gm;
    return value.replace(invalidCharacters, '_');
    //return value.split(invalidCharacters.split()).join('_');
  },

  "copy": (file) => {
    // source exist with cwd appended?
    if (fs.existsSync(file.path)) {
      // lets make sure the directory exists.
      let outDir = path.join(cwd, songDirectory);
      let extension = path.extname(file.path);
      let newFileName = fn.scrub(file.title) + extension;

      if (!fs.existsSync(outDir))
        fs.mkdirSync(outDir)
      
      // Does the file already exist?
      if (fs.existsSync(path.join(outDir, newFileName))) {
        return 409;        
      } else {
        fs.copyFileSync(file.path, path.join(outDir, newFileName));
        return 200;
      }
    } else {
      return 404;
    }

  },

  "action": (file) => {
    file = path.join(cwd, file);

    const read = readline.createInterface({
      input: fs.createReadStream(file)
    });

    let properties = {};

    read.on('line', line => {
      if (line.length > 0) {
        let index = line.indexOf('=');
        if (index > 0);

        let prop = line.substr(0, index);
        index += 1;
        let val = line.substr(index, line.length - index);

        properties[prop] = val;
      }
    });

    read.on('close', () => {
      let entries = Number(properties.NumberOfEntries);
      if (entries) {
        console.log(`Found ${entries} ${entries === 1 ? 'song' : 'songs'}.\n`);
        let failedCount = 0;
        let skippedCount = 0;

        for (let i = 1; i <= entries; i++) {
          let songFile = properties["File" + i];
          let songLength = Number(properties["Length" + i]);
          let songTitle = properties["Title" + i];

          if (songLength || songLength > 0) {
            switch (fn.copy({ path: songFile, title: songTitle })) {
              case 200: // Copied, success.
                //console.log(`200 - '${songTitle}' copied.`);
                break;
              
              case 404: // File Source Not Found.
                failedCount += 1;
                console.log(`404 - '${songFile}' not found, can't copy.`);
                break;
              
              case 409: // Resource Conflict (Already Exists.)
                skippedCount += 1;
                console.log(`409 - '${songFile}' already exists, skipping copy.`);
                break;
            }
          } else {
            failedCount += 1;
            console.log(`401 - '${songFile}' is most likely protected, ignoring copy.`);
          }
        }

        console.log(`\n${entries - (failedCount + skippedCount)} files copied, ${failedCount} failed, ${skippedCount} skipped.`);
        
      } else {
        console.log(`\nNo songs found.`);
      }
    })

  }

}

if (files.length === 0) {
  if (filterExtension) {
    console.log(`No ${filterExtension.replace('.', '')} files present in directory. Copy the ${filterExtension.replace('.', '')} files into \n'${cwd}'`);
  }
  rl.close();
} else {
  if (files.length > 1) {
    fn.showList();
  }
  else {
    // we don't need to ask any questions so, kill the readline tool.
    rl.close();
    fn.action(files[0]);
  }
}