<template>
  <div>
    <button
      v-b-tooltip.hover
      class="btn btn-outline-light mr-2"
      :title="$t('main.shutdown')"
      @click="shutdown()"
    >
      <i class="fas fa-power-off" />
    </button>

    <div class="locale-changer">
      <select v-model="lang">
        <option
          v-for="(langItem, i) in langs"
          :key="`Lang${i}`"
          :value="langItem"
        >
          {{ langItem }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import EventBus from '../event-bus';

export default {
    name: 'LocaleChanger',
    data () {
      return { langs: ['en', 'nl'] };
    },
    computed: {
      lang: {
        get: function() {
          return this.$store.state.locale;
        },
        set: function(newVal) {
          this.$store.dispatch('setLocale', newVal);
        }
      }
    },
    methods: {
      shutdown(){
        if (confirm(this.$i18n.t('main.shutdown_confirm'))) {
          this.busy = true;
          fetch(`http://${location.hostname}/api/shutdown`)
          .then(res => res.text())
          .then(data => {
             alert( this.$i18n.t('main.shutdown_success'));
          });
        }
      }
    },

};
</script>
