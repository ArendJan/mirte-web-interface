<template>
    <div class="h-100" >
        <div id="terminal" ref="terminal" class="xterm h-100"></div>
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
        reader: {},
        writer: {},
        readableStreamClosed: {},
        writableStreamClosed: {}
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
                    // console.log("waiting for connection");
                     this.waitForSocketConnection();
                  }.bind(this), 10);
              };

              this.linenr_socket.onopen = (event) => {
                  this.linenr_socket.send("c");
                  this.$store.dispatch('setExecution', 'running');
              };

              this.linenr_socket.onmessage = (event) => {
                if (event.data != 0) {
                  // Update only when in step/pause mode
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
                   this.waitForSocketConnection();
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
              //this.term.setOption('theme', {});
              //this.shell_socket.send("stty echo && PS1='\\[\\e]0;\\u@\\h: \\w\\a\\]${debian_chroot:+($debian_chroot)}\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ ' && clear\n");
              //this.term.setOption('disableStdin', false);
           } else {
              //this.term.setOption('theme', { background: '#e2e8e9', foreground: '#e2e8e9', cursor: '#e2e8e9' });
              //this.shell_socket.send("stty -echo && PS1='' && clear\n");
              //this.shell_socket.send("clear\n");
              //this.term.setOption('disableStdin', false);
              //this.term.setOption('theme', { background: '#e2e8e9', foreground: '#000000', cursor: '#e2e8e9' });
           }
        },
        toggleTerminal() {
            //this.setTerminal(this.term.getOption('disableStdin'));
        },
        async ble_port() {
            const main = "ADAF0000-4669-6C65-5472-616E73666572".toLowerCase();
            const tx = "ADAF0100-4669-6C65-5472-616E73666572".toLowerCase();
            const rx = "ADAF0200-4669-6C65-5472-616E73666572".toLowerCase();
            const filters = [
        //    { acceptAllDevices: true}
                { services: [main] }
            ];
            const options = {
                // filters,
                acceptAllDevices: true,

                optionalServices: [tx,rx ]
            };
            const device = await navigator.bluetooth.requestDevice(options);
            // print(device);
            const server = await device.gatt.connect();
            console.log(server);
            const service = await server.getPrimaryService(main);
            console.log(service);
            const characteristic = await service.getCharacteristic(rx);
            console.log(characteristic);
            const characteristic2 = await service.getCharacteristic(tx);
            const in_arr = [];
            try {
                characteristic2.addEventListener('characteristicvaluechanged', (event) => {
                    // console.log(event);
                    const value = event.target.value;
                    // console.log(value);
                    let arr = Array.from( new Uint8Array(value.buffer));
                    in_arr.push(...arr);
                    let str = String.fromCharCode(...arr);
                    console.log('Received21 ', str, arr);
                    // console.log('Received2 ' + value);
                });
                await characteristic2.startNotifications();
            } catch (error) {
                console.error('Argh2! ' + error);
            }
            console.log(characteristic2);
            window.send = async function(text) {
                let view = new DataView(new ArrayBuffer(text.length+2));
                [...text].forEach((l, i) => {
                    view.setUint8(i, l.charCodeAt(0));
                })
                view.setUint8(text.length, 0x0d); // CR
                view.setUint8(text.length+1, 0x0a); // LF
                console.log(view);
                let x = await characteristic.writeValue(view.buffer);
                console.log(x);
                try {
                    // await characteristic.writeValue(view); // tx from site
                    // await characteristic2.writeValue(view);
                } catch (error) {
                    console.error('Argh3! ' + error);
                }
            }
            window.sendR = async function(num) {
                let view = new DataView(new ArrayBuffer(1));
                 
                    view.setUint8(0, num);
                // })
                // view.setUint8(text.length, 0x0d); // CR
                // view.setUint8(text.length+1, 0x0a); // LF
                console.log(view);
                let x = await characteristic.writeValue(view.buffer);
                console.log(x);
                try {
                    // await characteristic.writeValue(view); // tx from site
                    // await characteristic2.writeValue(view);
                } catch (error) {
                    console.error('Argh3! ' + error);
                }
            }
            let view = new DataView(new ArrayBuffer(5));
            view.setUint8(0, 0x01);
            view.setUint8(1, 0x02);
            view.setUint8(2, 0x03);
            try {
                // await characteristic.writeValue(view); // tx from site
                // await characterfistic2.writeValue(view);
            } catch (error) {
                console.error('Argh3! ' + error);
            }
            return {
                write: async function(text) {
                    let view = new DataView(new ArrayBuffer(text.length));
                    [...text].forEach((l, i) => {
                        view.setUint8(i, l.charCodeAt(0));
                    })
                    // view.setUint8(text.length, 0x0d); // CR
                    // view.setUint8(text.length+1, 0x0a); // LF
                    console.log(view);
                    let x = await characteristic.writeValue(view.buffer);
                    console.log(x);
                    // try {
                    //     // await characteristic.writeValue(view); // tx from site
                    //     // await characteristic2.writeValue(view);
                    // } catch (error) {
                    //     console.error('Argh3! ' + error);
                    // }
                },
                read: async function() {
                    const values = [...in_arr];
                    in_arr.length = 0;
                    return {done: false, value:values};
                }
            }
        },
        async connectCode(){
            return await this.connectCodeBle();
             if (this.$store.getters.getSerialStatus == "connected"){
                 this.reader.cancel();
                 await this.readableStreamClosed.catch(() => { /* Ignore the error */ });

                 this.writer.close();
                 await this.writableStreamClosed;

                 await this.serial_port.close();
                 this.$store.dispatch('setSerialStatus', 'disconnected');
             } else {
                 // TODO: try catch
                 this.serial_port = await navigator.serial.requestPort();
                 this.serial_port.addEventListener('disconnect', (event) => {
                     this.$store.dispatch('setSerialStatus', 'disconnected');
                 });
                 await this.serial_port.open({ baudRate: 115200 });

                 const textEncoder = new TextEncoderStream();
                 this.writer = textEncoder.writable.getWriter();
                 this.writableStreamClosed = textEncoder.readable.pipeTo(this.serial_port.writable);
 
                 this.writeLineToPort('\x03\x03');
                 this.upload_mirte_api();

                 this.$store.dispatch('setSerialStatus', 'connected');

                 const textDecoder = new TextDecoderStream();
                 this.readableStreamClosed = this.serial_port.readable.pipeTo(textDecoder.writable);
                 this.reader = textDecoder.readable.getReader();
                 await this.read_serial_data();
             }
        },
        async connectCodeBle(){
            //  if (this.$store.getters.getSerialStatus == "connected"){
            //      this.reader.cancel();
            //      await this.readableStreamClosed.catch(() => { /* Ignore the error */ });

            //      this.writer.close();
            //      await this.writableStreamClosed;

            //      await this.serial_port.close();
            //      this.$store.dispatch('setSerialStatus', 'disconnected');
            //  } else {
            //      // TODO: try catch
                this.serial_ble_port = await this.ble_port();
                //  this.serial_port.addEventListener('disconnect', (event) => {
                //      this.$store.dispatch('setSerialStatus', 'disconnected');
                //  });

                //  const textEncoder = new TextEncoderStream();
                //  this.writer = textEncoder.writable.getWriter();
                //  this.writableStreamClosed = textEncoder.readable.pipeTo(this.serial_port.writable);
 
                await this.writeLineToPort('\x03\x03');
                await this.upload_mirte_api();

                this.$store.dispatch('setSerialStatus', 'connected');

                //  const textDecoder = new TextDecoderStream();
                //  this.readableStreamClosed = this.serial_port.readable.pipeTo(textDecoder.writable);
                //  this.reader = textDecoder.readable.getReader();
                await this.read_serial_data();
            //  }
        },
        async read_serial_data(){
          // Listen to data coming from the serial device.
          let line = ""
          setInterval(async () => {
            const { value, done } = await this.serial_ble_port.read();
              if (done) {
                // Allow the serial port to be closed later.
                this.reader.releaseLock();
                return; 
              }

            let nextpart = line + value
            let splits = nextpart.split('\n')
            for (var i = 0; i < splits.length; i++){
              let curline = splits[i]
              if (i == splits.length -1){
                line = curline;
              } else {
                // Do not show the python commands themselves
                if (curline.substring(0,3) != ">>>" && curline.substring(0,3) != "..." && curline.substring(0,13) != "MicroPython v" && curline.substring(0,13) != 'Type "help()"'){
                   this.term.write(curline + "\n")
                }
              }
            }
          }, 100);
        },
        async upload_mirte_api(){
             // Make dir
             await this.writeLineToPort('import os')
             await this.writeLineToPort('if "mirte_robot" not in os.listdir():')   //os.path. does not exist in micropython
             await this.writeLineToPort('  os.mkdir("mirte_robot")')
             await this.writeLineToPort('')

             // Make class
             await this.putFile("/mirte_robot/__init__.py", "");

             // Upload Mirte API (TODO: do so in a beter way)
             let code = "from machine import Pin, ADC, PWM\nmirte = {}\n\nclass Robot():\n  def __init__(self):\n    i = 20\n\n  def setDigitalPinValue(self, pin, value):\n    Pin(int(pin), Pin.OUT).value(value)\n\n  def setAnalogPinValue(self, pin, value):\n    pwm = PWM(Pin(int(pin)))\n    pwm.freq(1000)\n    pwm.duty_u16(value)\n\n  def getDigitalPinValue(self, pin):\n    return Pin(int(pin), Pin.IN).value()\n\n  def getAnalogPinValue(self, pin):\n    return ADC(int(pin)).read_u16()\n\ndef createRobot():\n  global mirte\n  mirte = Robot()\n  return mirte"
             await this.putFile("/mirte_robot/robot.py", code);

             // Upload main.py
             code = "from testrepl import start\nstart()\nimport sys\nfrom machine import Pin\ntry:\n  exec(open('./mirte.py').read(),globals())\nexcept KeyboardInterrupt:\n  for i in range(0,29):\n    Pin(i, Pin.IN, Pin.PULL_DOWN)\n  sys.exit(0)\nfor i in range(0,29):\n  Pin(i, Pin.IN, Pin.PULL_DOWN)";
             await this.putFile("/main.py", code);

        },
        async play(){
             // Uploade code
             const code = this.$store.getters.getCode;
             await this.writeLineToPort('\x03\x03') // Send CTRL-C to kill running program (needed?)
             await this.putFile("mirte.py", code); 

             // And run right away
             // TODO: in order to get step and pause wokring we need to execute it line by line
             // 1) by introcuding a linetrace? or 2) just doing it step by step here?
             await this.writeLineToPort('exec(open("main.py").read(),globals())')
        },
        async stopCode(){
            await this.writeLineToPort('\x03\x03') // Send CTRL-C to kill running program
             //this.writeLineToPort('import machine');
             //this.writeLineToPort('machine.soft_reset()');
        },
        async putFile(filename, code){
            await this.writeLineToPort("f = open('" + filename + "', 'wb')");

          var lines = code.split('\n');
          for(var i = 0;i < lines.length;i++){
              // do i need to escape anything?
              await this.writeLineToPort('e = f.write("' + lines[i] + '\\n")');
          }

          await this.writeLineToPort("f.close()");
        },
        async writeLineToPort(line){
           //console.log("[WRITE] " + line);
           await this.serial_ble_port.write(line + '\r');
        },
    },
    mounted()  {
       // Open the websocket connection to the backend
        this.shell_socket = shell_socket;

        // The terminal
        this.term = new Terminal({theme: { background: '#e2e8e9', foreground: '#000000', cursor: '#e2e8e9' }});
        const fitAddon = new FitAddon();
        //this.term.loadAddon(new AttachAddon(this.shell_socket));
        this.term.loadAddon(fitAddon);
        this.term.open(this.$refs.terminal);
        fitAddon.fit();
        //const dimensions = fitAddon.proposeDimensions();
        //console.log(dimensions);
        //if (!isNaN(dimensions.cols) && !isNaN(dimensions.rows)){
        //   this.term.resize(dimensions.cols, dimensions.rows);
        //}
        //this.term.setOption('disableStdin', true);
        
        // Load env variables
        this.shell_socket.onopen = (ev) => {
            this.shell_socket.send("stty -echo && PS1='' && clear\n");
            this.shell_socket.send("clear\n");
            this.shell_socket.send("cd /home/mirte/workdir/ && source /opt/ros/noetic/setup.bash && source /home/mirte/mirte_ws/devel/setup.bash && pkill -f mirte_robot.linetrace || /bin/true && python3 -m mirte_robot.linetrace & clear\n");
        };

        // Autoresize terminal on size change
        const observer = new ResizeObserver(entries => {
           fitAddon.fit();
//           const dimensions = fitAddon.proposeDimensions();
//           console.log(dimensions);
//           if (!isNaN(dimensions.cols) && !isNaN(dimensions.rows)){
//              this.term.resize(dimensions.cols, dimensions.rows);
//           }
        })
        observer.observe(this.$refs.terminal)

        // event bus for control functions
        EventBus.$on('control', (payload) => {

            switch(payload){
                case "connect":
                    this.connectCode()
                    break;
                case "play":
                    //this.term.setOption('theme', { background: '#e2e8e9', foreground: '#000000', cursor: '#e2e8e9' });
                    //this.playCode()
                    this.play()
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
