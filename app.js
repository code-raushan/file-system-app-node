const fs = require("fs/promises");

// dealing with the file
// 1. Open -saving the file descriptor( a number, assigned to a file opened) in the memory for refernce to the file
// 2. Read/Write
// after all works and operations, 3. close that file

//IIFE
(async () => {
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";
  // function to create a file;
  const createFile = async (path) => {
    try {
      const existingFile = await fs.open(path, "r");
      existingFile.close();
      // if no error, means the file already exist
      console.log("the file already exist.");
    } catch (error) {
      const fileCreated = await fs.open(path, "w");
      fileCreated.close();

      console.log(`the file ${path} was created successfully.`);
    }
  };

  // function to delete a file;
  const deleteFile = async (path) => {
    try {
      const fileExist = await fs.open(path, "r");
      fileExist.close();

      await fs.unlink(path);
      console.log(`successfully deleted ${path}`);
    } catch (error) {
      console.log(`this file ${path} does not exist.`);
    }
  };

  // function to rename the file;

  const renameFile = async (oldPath, newPath) => {
    try {
        const fileExist = await fs.open(oldPath, 'r');
        fileExist.close();

        await fs.rename(oldPath, newPath);
        console.log(`successfully renamed ${oldPath} to ${newPath}`);

    } catch (error) {
        console.log(`this file ${oldPath} does not exist`);
    }
  };

  // function to add to the file;
  const addToFile = async(path, content)=>{
    const file = await fs.open(path, 'a');
    file.write(content);
    file.close();
    console.log(`successfully wrote "${content}" to ${path}`);
  }

  //A <FileHandle> object is an object wrapper for a numeric file descriptor.

  //Instances of the <FileHandle> object are created by the fsPromises.open() method.
  const commandFileHandler = await fs.open("./command.txt", "r");

  // All FileHandle objects are EventEmitters.

  commandFileHandler.on("change", async () => {
    //reading the content

    //-> getting the size of our file
    const size = (await commandFileHandler.stat()).size;

    //A buffer that will be filled with the file data read.

    const buff = Buffer.alloc(size);

    //The location in the buffer at which to start filling.

    const offset = 0;

    //The number of bytes to read.
    const length = buff.byteLength; //byteLength: The length in bytes of the array.

    //The location where to begin reading data from the file.
    const position = 0;

    // read(): Reads data from the file and stores that in the given buffer.
    const content = await commandFileHandler.read(
      buff,
      offset,
      length,
      position
    );

    // console.log(content);
    // the buffer buff was populated
    const command = buff.toString("utf-8");

    // creating a file
    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      createFile(filePath);
    }
    // deleting a file
    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }
    // renaming a file
    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(" to ");
      const oldPath = command.substring(RENAME_FILE.length + 1, _idx);
      const newPath = command.substring(_idx + 4);

      renameFile(oldPath, newPath);
    }

    // add to a file
    // add to the file <path> this content: <content>
    if (command.includes(ADD_TO_FILE)){
        const _idx = command.indexOf(" this content: ");
        const path = command.substring(ADD_TO_FILE.length+1, _idx);
        const content = command.substring(_idx+15);
        addToFile(path, content)
        
    }

  });

  //Watch for changes on filename, where filename is either a file or a directory, returning an FSWatcher.
  const watcher = fs.watch("./command.txt");

  for await (const event of watcher) {
    //event contains object of name of event that occured and the filename

    //console.log(event)

    if (event.eventType === "change" && event.filename === "command.txt") {
      console.log("new command executed...");
    }
    commandFileHandler.emit("change");
  }
})();
