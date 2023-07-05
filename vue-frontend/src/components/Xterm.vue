<template>
    <div>
        <div id="terminal" ref="terminal" class="xterm"></div>
    </div>
</template>

<script>
import { Terminal } from 'xterm';
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import shell_socket from '../ws-connection/xterm-connection.js'

import EventBus from '../event-bus';

export default {
    data: () => ({
        shell_socket: WebSocket,
        linenr_socket: WebSocket,
        term: Terminal,
    }),
    activated: function(){
        this.term.focus();
    },
    methods: {
        waitForSocketConnection(){
              // TODO: correctly close the connection
              const protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
              const linetrace_socketUrl = `${protocol}${location.hostname}/ws/linetrace`;
              this.linenr_socket = new WebSocket(linetrace_socketUrl);

              this.linenr_socket.onerror = (event) => {
                  setTimeout(function () {
                     console.log("waiting for connection");
                     this.waitForSocketConnection();
                  }.bind(this), 10);
              };

              this.linenr_socket.onmessage = (event) => {
                if (event.data != 0) {
                  // Update only when in step/pause mode
                  if (event.data.substr(0, 4) == "pid:"){
                     let debugger_pid = String(event.data.substr(4));
let strace_cmd = 'strace -ff -e write=1,2 -s 1024 -p ' + debugger_pid + ' 2>&1 | grep "^ |" --line-buffered | stdbuf -oL cut -b11-60 | stdbuf -oL sed -e "s/ //g" | xxd -r -p';
                     this.shell_socket.send(strace_cmd + '\n');
                     this.$store.dispatch('setExecution', 'running');
                  }
                  if (this.$store.getters.getExecution == "paused") {
                     this.$store.dispatch('setLinenumber', event.data);
                  }
                } else {
                  this.$store.dispatch('setLinenumber', null);
                  this.$store.dispatch('setExecution', 'stopped');
                }
              };
        },
        playCode() {
            if (this.$store.getters.getExecution == "paused"){
               this.linenr_socket.send("c");
               this.$store.dispatch('setExecution', 'running');
            } else {
               // Not running, so upload code and start executing
               const pythonUrl = `http://${location.hostname}/api/python`;

               fetch(pythonUrl, {
                   method: 'POST',
                   headers: {
                       'Content-Type': 'text/plain',
                       'CORS': 'Access-Control-Allow-Origin'
                   },
                   body: this.$store.getters.getCode,
               }).then(res => {
                   this.linenr_socket.send("c");
               }).catch(err => {
                   console.log("sending failed")
                   console.log(err)
               })
               }
        },
        stopCode() {
            this.linenr_socket.send("e");
            this.$store.dispatch('setLinenumber', null)
            this.$store.dispatch('setExecution', 'stopped');
        },
        pauseCode() {
            this.linenr_socket.send("b");
            this.$store.dispatch('setExecution', 'paused');
        },
        stepCode() {
            this.linenr_socket.send("s");
        },
        clearOutput() {
            // stop running program, clear terminal, remove step indicator
            this.linenr_socket.send("e");
            this.$store.dispatch('setExecution', 'stopped');
            this.shell_socket.send("clear\n");
            this.$store.dispatch('setLinenumber', null)
        },
        setTerminal(terminal){
           if (terminal){
              this.term.setOption('theme', {});
              this.shell_socket.send("stty echo && PS1='\\[\\e]0;\\u@\\h: \\w\\a\\]${debian_chroot:+($debian_chroot)}\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ ' && clear\n");
              this.term.setOption('disableStdin', false);
           } else {
              this.term.setOption('theme', { background: '#e2e8e9', foreground: '#e2e8e9', cursor: '#e2e8e9' });
              this.shell_socket.send("stty -echo && PS1='' && clear\n");
              this.shell_socket.send("clear\n");
              this.term.setOption('disableStdin', true);
              this.term.setOption('theme', { background: '#e2e8e9', foreground: '#000000', cursor: '#e2e8e9' });
           }
        },
        toggleTerminal() {
            this.setTerminal(this.term.getOption('disableStdin'));
        },
    },
    mounted()  {
        // Open the websocket connection to the backend
        this.shell_socket = shell_socket;

        // Open the websocket connection to the debugger
        this.waitForSocketConnection();

        // The terminal
        this.term = new Terminal({theme: { background: '#e2e8e9', foreground: '#e2e8e9', cursor: '#e2e8e9' }});
        const fitAddon = new FitAddon();
        this.term.loadAddon(new AttachAddon(this.shell_socket));
        this.term.loadAddon(fitAddon);
        this.term.open(this.$refs.terminal);
        // fitAddodn.fit() gives error
        const dimensions = fitAddon.proposeDimensions();
        if (!isNaN(dimensions.cols) && !isNaN(dimensions.rows)){
           this.term.resize(dimensions.cols, dimensions.rows);
        }
        this.term.setOption('disableStdin', true);
        
        // Load env variables
        this.shell_socket.onmessage = (ev) => {
           if (this.$store.getters.getExecution == "disconnected") {
              this.shell_socket.send("unset HISTFILE && stty -echo && PS1='' && clear\n");
              this.shell_socket.send("source /home/mirte/mirte_ws/devel/setup.bash && cd /home/mirte/workdir && clear\n");
              this.$store.dispatch('setExecution', 'stopped');
           }
        }

        // Autoresize terminal on size change
        const observer = new ResizeObserver(entries => {
           //fitAddon.fit() gives error
           const dimensions = fitAddon.proposeDimensions();
           if (!isNaN(dimensions.cols) && !isNaN(dimensions.rows)){
              this.term.resize(dimensions.cols, dimensions.rows);
           }
        })
        observer.observe(this.$refs.terminal)

        // event bus for control functions
        EventBus.$on('control', (payload) => {

            switch(payload){
                case "play":
                    this.term.setOption('theme', { background: '#e2e8e9', foreground: '#000000', cursor: '#e2e8e9' });
                    this.playCode()
                    break;
                case "stop":
                    this.stopCode()
                    break;
                case "step":
                    this.stepCode()
                    break;
                case "pause":
                    this.pauseCode()
                    break;
                case "clear":
                    this.clearOutput()
                    break;
                case "terminal":
                    this.toggleTerminal()
                    break;
            }
        });
    }

}
</script>
