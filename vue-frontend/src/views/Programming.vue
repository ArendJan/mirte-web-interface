<template>


       <div class="row p-4 h-100">

         <div class="col-3 p-2 h-100" style="overflow: hidden;">
             <div class="layoutbox rounded h-100" style="overflow: hidden; display: flex; flex-flow: column;">

                <div class="text-white p-2 h3 m-0 layoutbox-title w-100 background-primary">
                   {{ $t('main.sensors') }}
                </div>


                <div class="h-100" style="overflow-y: auto;">
                   <Sensors/>
                </div>


             </div>-         
         </div>

         <div class="col-6 p-2 h-100" style="overflow: hidden;"> 
             <div class="layoutbox rounded h-100" style="overflow: hidden; display: flex; flex-flow: column;">

                <div class="text-white p-2 h3 m-0 layoutbox-title w-100 background-primary">
                  {{ $t('main.programming') }}

        <button :disabled="isBlockly" class="btn btn-outline-light mr-2"
            @click="setLanguage('blockly')"
        >
           {{ $t('programming.blockly') }}
        </button>

        <button :disabled="!isBlockly" class="btn btn-outline-light mr-2"
            @click="setLanguage('python')"
        >
           {{ $t('programming.python') }}
        </button>


                      

                      <div style="float: right">
                        <ControlButtons/>
                      </div>
                </div>
                  
           
                <div v-if="isBlockly" class="h-100"> 
                    <Blockly/>
                </div>


                <div v-else class="h-100">
                    <Codemirror/>
                </div>


              



             </div>
         </div> 


         <div class="col-3 p-2 h-100" style="overflow: hidden;"> 
             <div class="layoutbox rounded h-100" style="overflow: hidden; display: flex; flex-flow: column;">

                <div class="text-white p-2 h3 m-0 layoutbox-title w-100 background-primary">
                   {{ $t('main.actuators') }}
                </div>
                  
           
                <div class="h-100" style="overflow-y: auto;">
                   <Actuators/>
                </div>
              

             </div>
         </div> 

      </div>
    </div> 



</template>

<script>

import Blockly from '@/components/Blockly.vue'
import ControlButtons from '@/components/ControlButtons.vue'
import Sensors from '@/components/Sensors.vue'
import Actuators from '@/components/Actuators.vue'
import Codemirror from '@/components/Codemirror.vue'

export default {
  components: {
    Blockly,
    ControlButtons,
    Sensors,
    Actuators,
    Codemirror
  },
  data: () => ({
        language: "blockly",
  }),
  methods: {
        setLanguage(language) {
	   this.language = language;
        },
  },
  computed: {
       isBlockly: function(){
           return this.language == "blockly";
       },
  }




}
</script>
