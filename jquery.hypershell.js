/* 
 *  FILE NAME:    commandline_v04.js
 *  CREATED ON:   6-jul-2015
 *  AUTHOR:       Luca Costanzi (luca.costanzi@gmail.com)
 *  --------------------------
 *  DESCRIPTION:
 *  
 *  VERSIONS:
 *  0.4
 */
(function($) {
    function launchIntoFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    function commandLine(item, options) {

        this.options = $.extend({
            tree: {Root: {"readme.txt": "<--------------Welcome on HyperShell!-----------------></br><br/>You can use the UP and DOWN arrow keys to scroll through previosly executed commands.<br/>Start typing a file or directory name and press TAB to autocomplete it.</br>Executables (EXE) files can be launched just by typing the filename."}},
            brightness: 0,
            baseFolder: "C:",
            title: "<div id=\"title\"><span class='newfont'>HYPERSHELL84</span><br/>now loading<span id='cursor'>..</span></div>",
            pageContent: "HyperShell84 [Version 1.0.0.2]<br/>Copyright 1983 Luca Costanzi. All rights reserved.<br/><br/>Type HELP and press ENTER to display a list of commands.<br/>To know more check the file readme.txt.<br/><br/>"
        }, options);
        this.tree = this.options.tree;
        this.lineNr = 0;
        this.browseNr = 0;
        this.linesContent = [];
        this.linesContent[this.lineNr] = "";
        this.cursor = "<span id='cursor'>&nbsp;</span>";
        this.cursorPosition = 0;
        this.f = 1;
        this.baseFolder = this.options.baseFolder;
        this.curFolder = this.options.baseFolder;
        this.monitor = $(item);
        this.monitor.html("<div id=\"grid\"></div>");
        this.grid = $("#grid");
        this.windowsArray = [];
        this.loggedIn = false;
        this.password = "";
        this.pageContent = this.options.pageContent;
        this.boot();
    }

    commandLine.prototype = {
        boot: function() {
            this.grid.html(this.options.title);
            setTimeout(this.startConsole.bind(this), 3000);
        },
        createWindow: function() {
            t = this;
            nwindows = t.windowsArray.length;
            nextNWindow = nwindows++;
            htmlTags = "<div class=\"window\" id='window" + nextNWindow + "'><div id='topbar" + nextNWindow + "' class=\"topbar\"><div id='exetitle" + nextNWindow + "' class=\"exetitle\"></div><div id='closeBtn" + nextNWindow + "' class=\"closeBtn\">X</div></div><iframe src=\"\" id='exewindow" + nextNWindow + "' class=\"exewindow\" ></iframe></div>";
            t.monitor.append(htmlTags);
            nw = t.windowsArray[nextNWindow] = $("#window" + nextNWindow);
            nw.draggable({handle: "#topbar" + nextNWindow});
            nw.resizable();
            t.windowsArray[nextNWindow].find(".closeBtn").on("click", function() {
                $(this).remove();
                t.monitor.focus();
                t.grid.scrollTop(t.grid[0].scrollHeight + 10);
            }.bind(t.windowsArray[nextNWindow]));
            return nextNWindow;
        },
        startConsole: function() {
            var t = this;
            setInterval(function() {
                if (t.f) {
                    t.f = 0;
                    $('#cursor').css("text-decoration", "underline");
                } else {
                    t.f = 1;
                    $('#cursor').css("text-decoration", "none");
                }
            }, 500);
            t.grid.html(t.pageContent + t.curFolder + "\\\>" + t.linesContent[t.lineNr] + t.cursor);
            t.grid.attr("tabindex", -1).focus();
            $(document).keydown(function(e) {
                keyCode = e.keyCode;
                if (keyCode == 9 || keyCode == 8 || keyCode == 40 || keyCode == 38 || keyCode == 13 || keyCode == 37 || keyCode == 39 || keyCode == 46) {
                    console.log("keydown");
                    e.preventDefault();
                    t.checkPressedKey(e, 1);
                }


            });
            $(document).keypress(function(e) {
                keyCode = e.keyCode;
                console.log("keypress" + keyCode);
                t.checkPressedKey(e, 0);
            });
        },
        checkPressedKey: function(e, keydown, callback) {
            var t = this;
            t.linesContent[t.lineNr] = t.linesContent[t.lineNr].replace("<span id='cursor'>", '');
            t.linesContent[t.lineNr] = t.linesContent[t.lineNr].replace("</span>", '');
            var keynum;
            if (window.event) { // IE					
                keynum = e.keyCode;
            } else
            if (e.which) { // Netscape/Firefox/Opera					
                keynum = e.which;
            }
            value = String.fromCharCode(keynum);
            keyCode = e.keyCode;
            console.log("keycode" + keyCode);
            console.log("value" + value);
            if (keyCode === 13) {//return
                command = t.linesContent[t.lineNr];
                t.pageContent += t.curFolder + "\\\>" + t.linesContent[t.lineNr] + "<br/>";
                t.lineNr++;
                t.linesContent[t.lineNr] = "";
                t.browseNr = t.lineNr;
                value = "";
                t.cursorPosition = 0;
                t.executeLine(command.toLowerCase());
            }
            if (keyCode === 37) {//arrow left
                value = "";
                if (t.cursorPosition > 0)
                    t.cursorPosition--;
            }
            if (keyCode === 39) {//arrow right
                value = "";
                if (t.cursorPosition < t.linesContent[t.lineNr].length)
                    t.cursorPosition++;
            }
            if (keyCode === 38) {//arrow up
                value = "";
                if (t.browseNr > 0) {
                    t.browseNr--;
                    t.linesContent[t.lineNr] = t.linesContent[t.browseNr];
                    t.cursorPosition = t.linesContent[t.browseNr].length;
                }
            }
            if (keyCode === 40) {//arrow down
                value = "";
                if (t.browseNr < t.lineNr - 1) {
                    t.browseNr++;
                    t.linesContent[t.lineNr] = t.linesContent[t.browseNr];
                    t.cursorPosition = t.linesContent[t.browseNr].length;
                }
                value = "";
            }
            if (keyCode === 8) {//delete
                value = "";
                if (t.cursorPosition - 1 >= 0) {
                    t.linesContent[t.lineNr] = t.linesContent[t.lineNr].slice(0, t.cursorPosition - 1) + t.linesContent[t.lineNr].slice(t.cursorPosition);
                    t.cursorPosition--;
                }

            }
            if (keyCode === 46 && keydown) {//canc
                value = "";
                if (t.cursorPosition + 1 <= t.linesContent[t.lineNr].length) {
                    t.linesContent[t.lineNr] = t.linesContent[t.lineNr].slice(0, t.cursorPosition) + t.linesContent[t.lineNr].slice(t.cursorPosition + 1);
                }

            }
            if (keyCode === 9) {//tab
                value = "";
                next = t.getCurFolder();
                lineElements = t.linesContent[t.lineNr].split(" ");
                if (lineElements !== undefined) {
                    if (typeof lineElements === "string") {
                        last_element = lineElements;
                    } else {
                        var last_element = lineElements[lineElements.length - 1];
                    }
                    if (last_element !== "" && last_element !== undefined) {
                        $.each(next, function(k, v) {
                            if (k.toLowerCase().indexOf(last_element.toLowerCase()) === 0) {
                                lineElements[lineElements.length - 1] = k;
                                t.linesContent[t.lineNr] = lineElements.join(" ");
                                t.cursorPosition = t.linesContent[t.browseNr].length;
                            }
                        });
                    }
                }
            }
            var BLIDRegExpression = /^[0-9a-zA-Z `!"?$%\^&*()_\-+={\[}\]:;@~#|<,>.'\/\\]+$/;
            if (keyCode !== 13) {
                if (BLIDRegExpression.test(value)) //
                    t.printContent(value);
                else
                    t.printContent("");
            }
        },
        printContent: function(value) {
            t = this;
            t.linesContent[t.lineNr] =
                    t.linesContent[t.lineNr].slice(0, t.cursorPosition) +
                    value +
                    "<span id='cursor'>" +
                    t.linesContent[t.lineNr].slice(t.cursorPosition, t.cursorPosition + 1) +
                    "</span>" +
                    t.linesContent[t.lineNr].slice(t.cursorPosition + 1);
            t.cursorPosition += value.length;
            console.log("pos" + t.cursorPosition + " value" + value + " vl" + value.length);
            t.grid.html(t.pageContent + t.curFolder + "\\\>" + t.linesContent[t.lineNr]);
            if ($("#cursor").html() === "")
                $("#cursor").html("&nbsp;");
            t.grid.scrollTop(t.grid[0].scrollHeight + 10);
        },
        executeLine: function(command) {
            t = this;
            command = $.trim(command);
            commandParts = command.split(" ");
            cmd = commandParts[0];
            console.log("command:" + cmd);
            t.printLn("");
            if (cmd === "") {
                t.printLn("");
                t.printContent("");
                return false;
            }
            if (cmd === "help") {
                t.showHelp();
                t.printLn("");
                t.printContent("");
                return false;
            }
            if (cmd === "ls") {
                t.listFiles();
                t.printLn("");
                t.printContent("");
                return false;
            }
            if (cmd === "cd") {
                t.changeDirectory(command);
                t.printContent("");
                return false;
            }
            if (cmd === "cd..") {
                t.changeDirectoryParent();
                t.printContent("");
                return false;
            }
            if (cmd === "cat") {
                t.readFile();
                return false;
            }
            if (cmd === "view") {
                t.viewFile();
                return false;
            }
            if (cmd === "mon") {
                t.changeMonitor();
                return false;
            }
            if (cmd === "login") {
                t.login();

                return false;
            }
            if (cmd === "logout") {
                t.logout();
                t.printLn("");
                t.printContent("");
                return false;
            }
            if (cmd === "send") {
                t.sendMessage();
                return false;
            }
            if (commandParts[1] === undefined) {
                t.executable(cmd);
                return false;
            }
            t.printLn("Error: unknown command " + commandParts[0]);
            t.printLn("");
            t.printContent("");
        },
        sendMessage: function() {
            t = this;
            parts = command.split(" ");

            if (parts[1] === undefined || parts[1] === "") {
                t.printLn("Error: no message to be sent.");
                t.printLn("");
                t.printContent("");
                return false;
            }
            msg = command.substring(command.indexOf(' ') + 1);
            request = $.ajax({
                url: "commandline/messages/messages.php",
                type: "POST",
                dataType: "text",
                data: {msg: msg},
                success: function(data, textStatus, jqXHR) {
                    t.printLn(data);
                    t.printLn("");
                    t.printContent("");
                },
                error: function(data, textStatus, jqXHR) {
                    t.printLn(textStatus);
                    t.printLn("");
                    t.printContent("");
                }
            });
        },
        refreshScreen: function() {
            t.grid.html(t.pageContent);
        },
        login: function() {
            t = this;
            parts = command.split(" ");
            if (parts[1] !== undefined)
                password = parts[1];
            else
                return false;
            request = $.ajax({
                url: "commandline/classes/login/login.php",
                type: "POST",
                data: {password: password},
                success: function(data, textStatus, jqXHR) {
                    if (data === "0") {
                        t.printLn("The password isn't correct.");
                    } else {
                        if (t.loggedIn) {
                            t.printLn("You are already logged in.");
                        } else {
                            t.password = password;
                            t.loggedIn = true;
                            t.printLn("You are now logged in.");

                        }
                    }
                    t.printLn("");
                    t.printContent("");
                },
                error: function(data, textStatus, jqXHR) {
                    t.printLn(textStatus);
                    t.printLn("");
                    t.printContent("");
                }
            });


        },
        logout: function() {
            t = this;
            if (!t.loggedIn) {
                t.printLn("You aren't logged in.");
            } else {
                t.loggedIn = false;
                t.printLn("You are now logged out.");
            }

        },
        printError: function(msg){
            t.printLn(msg);
            t.printLn("");
            t.printContent("");
        },
        getExecutable: function(location) {
            t = this;
            path = location.split("/");
            name = file = path[path.length - 1];
            path.pop();
            isDir = t.isDir(file);
            parts = file.split(".");
            ext = parts[1];
            if (ext === undefined || isDir) {
                t.printError("Error: "+location + " can't be read or executed.");
                return false;
            }
            var next = t.getCurFolder();
            $.each(path, function(k, v) {
                next = next[v];
            });
            console.log(next);
            if (next === undefined || next[file] === undefined) {
                t.printError("Error: "+location + " doesn't exists.");
                return false;
            }
            if (next[file].pass && !t.loggedIn) {
                t.printError("Error: you must be logged in to access this file.");
                return false;
            }
            if (typeof next[file] !== "object") {
                t.printError("Error: "+location + " is corrupted or unreadable.");
                return false;
            }
            t.executable['file'] = next[file];
            t.executable['ext'] = ext;
            t.executable['filename'] = name;
            return true;
        },
        viewFile: function() {
            partsr = command.split(" ");
            if (partsr[1] === undefined || partsr[1] === "") {
                t.printError("Error: please specify a file to view.");
                return false;
            }
            if(!t.getExecutable(partsr[1]))
                return false;
            exeExt = t.executable.ext;
            exeFile = t.executable.file;
            exeName = t.executable.filename;
            if (exeExt !== "png" && exeExt !== "jpg") {
                t.printError("Error: can't display " + exeName +". Only jpg and pgn files are allowed.");
                return false;
            }
            nwId = t.createWindow();
            t.windowsArray[nwId].css("display", "block");
            $("#exewindow" + nwId).attr("src", "");
            $("#exetitle" + nwId).html(exeName);
            if (exeFile.width !== undefined)
                t.windowsArray[nwId].css("width", exeFile.width);
            if (exeFile.height !== undefined)
                t.windowsArray[nwId].css("height", parseInt(exeFile.height) + 20);
            if (exeExt === "png" || exeExt === "jpg") {
                $("#exewindow" + nwId).hide();
                t.windowsArray[nwId].append("<img class='loadedimg' id='loadedimg" + nwId + "' />");
                img = $("#loadedimg" + nwId);
                img.attr("src", exeFile.src);
            }
            t.printLn("Viewing " + exeName);
            t.printLn("");
            t.printContent("");
            return true;
        },
        readFile: function() {
            partsr = command.split(" ");
            if (partsr[1] === undefined || partsr[1] === "") {
                t.printError("Error: please specify a file to read.");
                return false;
            }
            if(!t.getExecutable(partsr[1]))
                return false;
            exeExt = t.executable.ext;
            exeFile = t.executable.file;
            exeName = t.executable.filename;
            if (exeExt !== "txt" && exeExt !== "mail") {
                t.printError("Error: can't read " + exeName);
                return false;
            }
            t.printLn("Reading " + exeName);
            t.printLn("");
            if (exeFile.content !== undefined) {
                t.printLn(exeFile.content);
                t.printLn("");
                t.printContent("");
            } else
                t.getExternalContents(exeFile.src);
            return true;
        },
        executable: function(cmd) {
            t = this;
            if(!t.getExecutable(cmd))
                return false;
            exeExt = t.executable.ext;
            exeFile = t.executable.file;
            exeName = t.executable.filename;
            if (exeExt !== "exe"){
                t.printError("Error: "+file + " can't be executed.");
                return false;
            }
            
            nwId = t.createWindow();
            t.windowsArray[nwId].css("display", "block");
            $("#exewindow" + nwId).attr("src", "");
            $("#exetitle" + nwId).html(exeName);
            if (exeFile.width !== undefined)
                t.windowsArray[nwId].css("width", exeFile.width);
            if (exeFile.height !== undefined)
                t.windowsArray[nwId].css("height", parseInt(exeFile.height) + 20);
            
            if (exeExt === "exe") {
                $("#exewindow" + nwId).show();
                $("#exewindow" + nwId).attr("src", exeFile.src);
                $("#exewindow" + nwId).focus();
            }
            t.printLn("Executing " + exeName);
            t.printLn("");
            t.printContent("");
            return true;
        },
        changeMonitor: function() {
            t = this;
            parts = command.split(" ");
            if (parts[1] !== undefined)
                com = parts[1];
            else
                return false;
            if(com !== "bright" && com !== "dark"){
                t.printError("Error: unsupported value "+com + ".");
                return false;
            }
            if (com === "bright") {
                t.monitor.css("background-color", "white");
                t.grid.css("color", "black");
            }
            if (com === "dark") {
                t.monitor.css("background-color", "black");
                t.grid.css("color", "#97ff00");
            }
            t.printLn("Brightness changed to "+ com);
            t.printLn("");
            t.printContent("");
        },
        showHelp: function() {
            t = this;
            t.printLn("List of commands");
            t.printLn("");
            t.printLn("<label class='tabbed'>CD&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[path]</label>Changes the current directory.");
            t.printLn("<label class='tabbed'>CD..</label>Changes to the parent directory.");
            t.printLn("<label class='tabbed'>HELP</label>Provides information for commands.");
            t.printLn("<label class='tabbed'>LOGIN&nbsp;&nbsp;[password]</label>Log-in as system administrator.");
            t.printLn("<label class='tabbed'>LOGOUT</label>Log-out from the system.");
            t.printLn("<label class='tabbed'>LS</label>Displays a list of files and subdirectories in the current directory.");
            t.printLn("<label class='tabbed'>MON&nbsp;&nbsp;&nbsp;&nbsp;[bright/dark]</label>Change the brightness of the screen.");
            t.printLn("<label class='tabbed'>CAT&nbsp;&nbsp;&nbsp;&nbsp;[file]</label>Prints the contents of a text [*.txt or *.mail] file.");
            t.printLn("<label class='tabbed'>SEND&nbsp;&nbsp;&nbsp;[message]</label>Sends a message to the sys admin.");
            t.printLn("<label class='tabbed'>VIEW&nbsp;&nbsp;&nbsp;[file]</label>Displays an image [*.jpg or *.png].");
        },
        showTree: function(list) {
            t = this;
            $.each(list, function(k, v) {
                if (typeof k === "string") {
                    if (!t.isDir(k)) {
                        t.printLn("<label class='tabbed'>FILE</label>" + k);
                    }
                    if (t.isDir(k)) {
                        t.printLn("<label class='tabbed'>DIR</label>" + k);
                    }
                }
            });
        },
        isDir: function(el) {
            parts = el.split(".");
            if (parts[1] === undefined) {
                if (el.src === undefined && el.content === undefined)
                    return true;
            }
            return false;
        },
        printLn: function(line) {
            t = this;
            t.pageContent += line + "<br/>";
        },
        changeDirectory: function() {
            t = this;
            parts = command.split(" ");
            if (parts[1] !== undefined)
                dirs = parts[1];
            else
                return false;
            dirList = dirs.split("/");
            var next1 = t.getCurFolder();
            $.each(dirList, function(k, v) {
                next1 = next1[v];
            });
            if (next1 !== undefined) {
                destKey = dirList[dirList.length - 1];
                if (!t.isDir(destKey)) {
                    t.printLn("Error: " + dirs + " is not a folder.");
                    t.printLn("");
                } else
                    t.curFolder += "\\" + dirList.join("\\");
            } else {
                t.printLn("Error: the system cannot find the specified path.");
                t.printLn("");
            }
        },
        changeDirectoryParent: function() {
            t = this;
            console.log(t.curFolder);
            if (t.curFolder === t.baseFolder)
                return false;
            folders = t.curFolder.split("\\");
            folders.pop();
            var next = t.tree;
            $.each(folders, function(k, v) {
                next = next[v];
            });
            if (next != undefined)
                t.curFolder = folders.join("\\");
        },
        listFiles: function() {
            t = this;
            t.printLn("Directory of " + t.curFolder + "");
            t.showTree(t.getCurFolder());
        },
        getCurFolder: function() {
            t = this;
            folders = t.curFolder.split("\\");
            var next = t.tree;
            $.each(folders, function(k, v) {
                next = next[v];
            });
            return next;
        },
        getExternalContents: function(src) {
            t = this;
            request = $.ajax({
                url: src,
                type: "POST",
                dataType: "text",
                success: function(data, textStatus, jqXHR) {
                    t.printLn(data);
                    t.printLn("");
                    t.printContent("");
                },
                error: function(data, textStatus, jqXHR) {
                    t.printLn(textStatus);
                    t.printLn("");
                    t.printContent("");
                }
            });
        }
    };
    $.fn.commandLine = function(opt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            var item = $(this), instance = item.data('commandLine');
            if (!instance) {
                // create plugin instance if not created
                item.data('commandLine', new commandLine(this, opt));
            } else {
                // otherwise check arguments for method call
                if (typeof opt === 'string') {
                    instance[opt].apply(instance, args);
                }
            }
        });
    };
}(jQuery));
