<template>
    <div>
        <button :disabled="isUndoDisabled" class="btn btn-outline-light mr-2"
            v-b-tooltip.hover
            :title="$t('programming.undo')"
            @click="control('undo')"
        >
            <i class="fas fa-undo"></i>
        </button>

        <button :disabled="isRedoDisabled" class="btn btn-outline-light mr-2"
            v-b-tooltip.hover 
            :title="$t('programming.redo')"
            @click="control('redo')"
        >
            <i class="fa fa-redo"></i>
        </button>

        <span class="nav-spacer"></span>

        <span v-b-tooltip :title="$t('programming.start')" style="display: inline-block;">
        <button :disabled="isPlayDisabled" class="btn btn-outline-light mx-2" 
            @click="control('play')">
            <i class="fas fa-play"></i>
        </button>
        </span>

        <span v-b-tooltip :title="$t('programming.pause')" style="display: inline-block;">
        <button :disabled="isPauseDisabled" 
            @click="control('pause')" class="btn btn-outline-light mr-2">
            <i class="fa fa-pause"></i>
        </button>
        </span>

        <span v-b-tooltip :title="$t('programming.step')" style="display: inline-block;">
        <button :disabled="isStepDisabled" class="btn btn-outline-light mr-2" 
            @click="control('step')">
            <i class="fa fa-step-forward"></i>
        </button>
        </span>

        <span v-b-tooltip :title="$t('programming.stop')" style="display: inline-block;">
	<button :disabled="isStopDisabled" class="btn btn-outline-light mr-2" 
            @click="control('stop')">
            <i class="fa fa-stop"></i>
        </button>
        </span>

        <span class="nav-spacer"></span>

        <button href="#" class="btn btn-outline-light mx-2" 
            v-b-tooltip.hover 
            :title="$t('programming.save')" 
            @click="download"
        >
            <i class="fa fa-save"></i>
        </button>

        <button class="btn btn-outline-light mr-2" 
            v-b-tooltip.hover 
            :title="$t('programming.open')" 
            @click="openFileWindow"
        >
            <i class="fa fa-folder-open"></i>
            <input ref="file_input" @change="upload" type="file" name="name" style="display: none;" />
        </button>

    </div>
</template>

<script>
import EventBus from '../event-bus';

export default {

    methods: {
        control(command) {
            EventBus.$emit('control', command);
        },

        openFileWindow(){
            this.$refs.file_input.value = null;
            if (this.$parent.language == 'blockly') {
                this.$refs.file_input.accept = ".xml";
            } else {
                this.$refs.file_input.accept = ".py";
            }
            this.$refs.file_input.click()
        },

        upload(){
            var fr=new FileReader(); 

            fr.onload = () => { 
                if (this.$parent.language == 'blockly') {
                    this.$store.dispatch('setBlockly', fr.result)
                } else {
                    this.$store.dispatch('setCode', fr.result)
                }
            } 

            if(this.$refs.file_input.files.length > 0){
                fr.readAsText(this.$refs.file_input.files[0]); 
            }
            
        },

        download(){
            if (this.$parent.language == 'blockly') {
                var text = localStorage.getItem("blockly");
                var filename = "mirte.xml";
            } else {
                var text = this.$store.getters.getCode;
                var filename = "mirte.py";
            }
            
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);

        },


    },
    computed: {
       isUndoDisabled: function(){
           return false; // TODO: determine strategy 
       },
       isRedoDisabled: function(){
           return false; // TODO: determine strategy
       },
       isPlayDisabled: function(){
          return this.$store.getters.getExecution == "running" || this.$store.getters.getExecution == "disconnected";
       },
       isPauseDisabled: function(){
          return this.$store.getters.getExecution != "running" || this.$store.getters.getExecution == "disconnected";
       },
       isStepDisabled: function(){
          return this.$store.getters.getExecution != "paused" || this.$store.getters.getExecution == "disconnected";
       },
       isStopDisabled: function(){
          return this.$store.getters.getExecution == "stopped" || this.$store.getters.getExecution == "disconnected";
       }
    }

}
</script>
