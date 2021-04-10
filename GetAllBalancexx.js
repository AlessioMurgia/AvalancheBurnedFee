const fs = require('fs')
const lineReader = require('line-reader');

// Data which will write in a file.

let i;
var FirstBlock = '100'
var LastBlock = '102'
var stops = [];
var starts = [];
var oncestart = true;
var oncestop = true;


function getstops(){
        fs.readFile("Outputstops.txt", (err, file) => {
            if (file.length === 0) {
                stops.push('0',LastBlock);

                for (i = 0; i < stops.length; i++) {
                    fs.appendFile('Outputstops.txt', stops[i] + '\n', (err) => {

                        // In case of a error throw err.
                        if (err) throw err;
                    })
                }
            } else {
                lineReader.eachLine('Outputstops.txt', function (line) {
                    stops.push(line);
                });
                if(!oncestop) {
                    setTimeout(function () {
                        stops.push(LastBlock);

                        fs.unlink('Outputstops.txt', function (err) {
                            if (err) throw err;
                            console.log('File deleted!');
                        });
                        for (i = 0; i < stops.length; i++) {
                            fs.appendFile('Outputstops.txt', stops[i] + '\n', (err) => {
                                // In case of a error throw err.
                                if (err) throw err;
                            })
                        }
                    }, 50);
                }
                else{
                    setTimeout(function () {
                        stops[stops.length-1] = LastBlock;

                        fs.unlink('Outputstops.txt', function (err) {
                            if (err) throw err;
                            console.log('File deleted!');
                        });
                        for (i = 0; i < stops.length; i++) {
                            fs.appendFile('Outputstops.txt', stops[i] + '\n', (err) => {
                                // In case of a error throw err.
                                if (err) throw err;
                            })
                        }
                    }, 50);
                }
            }
        })
    setTimeout(function (){console.log(stops)}, 100);
}

function getstarts(){
    fs.readFile("Outputstarts.txt", (err, file) => {
        if (file.length === 0) {
            starts.push(FirstBlock);
            for (i = 0; i < starts.length; i++) {
                fs.appendFile('Outputstarts.txt', starts[i] + '\n', (err) => {

                    // In case of a error throw err.
                    if (err) throw err;
                })
            }
        } else {
            lineReader.eachLine('Outputstarts.txt', function (line) {
                starts.push(line);
            });
            if(!oncestart) {
                setTimeout(function () {
                    starts.push(FirstBlock);
                    fs.unlink('Outputstarts.txt', function (err) {
                        if (err) throw err;
                        console.log('File deleted!');
                    });
                    for (i = 0; i < starts.length; i++) {
                        fs.appendFile('Outputstarts.txt', starts[i] + '\n', (err) => {

                            // In case of a error throw err.
                            if (err) throw err;
                        })
                    }
                }, 50);
            }
        }
    })
    setTimeout(function (){console.log(starts)}, 100);
}



getstops();
getstarts();





