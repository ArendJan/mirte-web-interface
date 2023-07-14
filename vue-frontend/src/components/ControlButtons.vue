<template>
  <div>
    <button
      v-b-tooltip.hover
      :disabled="isUndoDisabled"
      class="btn btn-outline-light mr-2"
      :title="$t('programming.undo')"
      @click="control('undo')"
    >
      <i class="fas fa-undo" />
    </button>

    <button
      v-b-tooltip.hover
      :disabled="isRedoDisabled"
      class="btn btn-outline-light mr-2" 
      :title="$t('programming.redo')"
      @click="control('redo')"
    >
      <i class="fa fa-redo" />
    </button>

    <span class="nav-spacer" />

    <span
      v-b-tooltip
      :title="$t('programming.start')"
      style="display: inline-block;"
    >
      <button
        :disabled="isPlayDisabled"
        class="btn btn-outline-light mx-2" 
        @click="control('play')"
      >
        <i class="fas fa-play" />
      </button>
    </span>

    <span
      v-b-tooltip
      :title="$t('programming.pause')"
      style="display: inline-block;"
    >
      <button
        :disabled="isPauseDisabled" 
        class="btn btn-outline-light mr-2"
        @click="control('pause')"
      >
        <i class="fa fa-pause" />
      </button>
    </span>

    <span
      v-b-tooltip
      :title="$t('programming.step')"
      style="display: inline-block;"
    >
      <button
        :disabled="isStepDisabled"
        class="btn btn-outline-light mr-2" 
        @click="control('step')"
      >
        <i class="fa fa-step-forward" />
      </button>
    </span>

    <span
      v-b-tooltip
      :title="$t('programming.stop')"
      style="display: inline-block;"
    >
      <button
        :disabled="isStopDisabled"
        class="btn btn-outline-light mr-2" 
        @click="control('stop')"
      >
        <i class="fa fa-stop" />
      </button>
    </span>

    <span class="nav-spacer" />

    <button
      v-b-tooltip.hover
      href="#" 
      class="btn btn-outline-light mx-2" 
      :title="$t('programming.save')" 
      @click="download"
    >
      <i class="fa fa-save" />
    </button>

    <button
      v-b-tooltip.hover 
      class="btn btn-outline-light mr-2" 
      :title="$t('programming.open')" 
      @click="openFileWindow"
    >
      <i class="fa fa-folder-open" />
      <input
        ref="file_input"
        type="file"
        name="name"
        style="display: none;"
        @change="upload"
      >
    </button>
  </div>
</template>

<script>
import EventBus from '../event-bus';

export default {
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
          return this.$store.getters.getExecution == "stopped" || this.$store.getters.getExecution == "disconnected";
       },
       isStopDisabled: function(){
          return this.$store.getters.getExecution == "stopped" || this.$store.getters.getExecution == "disconnected";
       }
    },

    methods: {
        control(command) {
            EventBus.$emit('control', command);
        },

        openFileWindow(){
            this.$refs.file_input.value = null;
            this.$refs.file_input.click();
        },

        upload(){
            var fr=new FileReader(); 

            fr.onload = () => { 
                console.log(fr.result);
                this.$store.dispatch('setBlockly', fr.result);
            }; 

            if(this.$refs.file_input.files.length > 0){
                fr.readAsText(this.$refs.file_input.files[0]); 
            }
            
        },

        download(){
            var text = localStorage.getItem("blockly");
            var filename = "mirte.xml";
            
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);

        },


    }

};
</script>
