# **WARNING**
## REVIEW THE CODE BEFORE USING
I only wrote this for my personal use. As with any code, executing this on a different environment might cause harm.  This was only tested on my machine.

## What
    This is a simple nodejs script that reads in a winamp PLS playlist file and copies the specified songs into a single folder.

## Why
    I wrote this so that I can easily move songs onto a thumbdrive for my car.

    I use winamp to select the songs I want to use, dragging and dropping from iTunes and File Explorer.


## How
    The script looks for `.pls` files in its `CWD`, and will ask you to select a file to scan.

    If only one file is present, it will use that one by default.

    The script then copies all the files from the playlist into the `cwd\songs` folder.


## Notes
    1. Its best to save the winamp PLS playlist to the folder containing this script.

    2. Any files with a length of zero seconds are ignored (usually .m3p apple write protected files will have a zero length).

    3. If files specified from multiple folders with the same title are found, only the first one will found will be copied, just change the title of the song (artist - song name) is used to create the new file.