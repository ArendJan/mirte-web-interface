<template>
  <div>
    <div class="container">
      <div class="layoutbox rounded">
        <div class="text-white p-2 h3 layoutbox-title w-100 background-primary">
          {{ $t('settings.wifi_header') }}
        </div>

        <div class="layoutbox-content">
          <div class="row before-submit">
            <div class="col">
              <form
                id="connect-form"
                class="form form-horizontal"
                :action="`http://${hostname}/wifi-connect/connect`"
                method="post"
              >
                <div class="form-group">
                  <label
                    for="ssid-select"
                    class="control-label col"
                  >{{ $t('settings.wifi_network') }}</label>
                  <div class="col">
                    <select
                      id="ssid-select"
                      v-model="selected.ssid"
                      class="form-control"
                      name="ssid"
                      @change="onChange($event)"
                    >
                      <option
                        v-for="n of networks"
                        :key="n.ssid"
                        :value="n.ssid"
                        :data-security="n.security"
                      >
                        {{ n.ssid }}
                      </option>
                    </select>
                  </div>
                </div>
                <div
                  v-show="security == 'enterprise'"
                  id="identity-group"
                  class="form-group"
                >
                  <label
                    for="identity"
                    class="control-label col"
                  >{{ $t('settings.wifi_user') }}</label>
                  <div class="col">
                    <input
                      v-model="selected.identity"
                      class="form-control"
                      name="identity"
                    >
                  </div>
                </div>
                <div class="form-group">
                  <label
                    for="passphrase"
                    class="control-label col"
                  >{{ $t('settings.wifi_password') }}</label>
                  <div class="col">
                    <input
                      v-model="selected.password"
                      :type="passwordFieldType"
                      class="form-control"
                      name="passphrase"
                    >
                    <!-- shows the password -->
                    <a @click="toggleVisibility()">hide/show</a>
                  </div>
                </div>
                <div class="form-group">
                  <div class="col">
                    <button
                      type="button"
                      class="btn btn-success"
                      @click="connect"
                    >
                      {{ $t('settings.wifi_connect') }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div
            id="submit-message"
            class="row hidden"
          >
            <div class="col">
              {{ $t('settings.wifi_message') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

// real world test data
// [{"ssid":"TP-LINK_2159","security":"wpa"},{"ssid":"Snelle wifi 5 euro op je muil","security":"wpa"},{"ssid":"Wifi en Adriaan","security":"wpa"},{"ssid":"ASUS_68_2G","security":"wpa"},{"ssid":"MICHAEL32","security":"wpa"},{"ssid":"DIRECT-5F-HP ENVY 7640 series","security":"wpa"},{"ssid":"DIRECT-G2DESKTOP-3CIBGTRmsMP","security":"wpa"},{"ssid":"Arashi 2.4GHz","security":"wpa"},{"ssid":"EMIL WIFI 2.4GHZ","security":"wpa"},{"ssid":"SystemMeltdown_Delft","security":"wpa"},{"ssid":"dlink","security":"wpa"},{"ssid":"edimax_2.4G_53F27E","security":"wpa"},{"ssid":"Geen wifi","security":"wpa"},{"ssid":"Cisco1905 2.4GHz","security":"wpa"},{"ssid":"Sitecom255D02","security":"wpa"},{"ssid":"Ik weet het nu wel","security":"wpa"}]

export default {
  name:"NetworkComponent",
  data: function () {
    return {
	networks: [],
        security: "wpa",
	hostname: "",
        selected: {password: "", ssid: "", identity: ""},
        passwordFieldType: "password"
    };
  },
  mounted(){
    
    fetch(`http://${location.hostname}/wifi-connect/networks`, {
        "method": "GET",
        "mode": "cors"})
    .then(res => res.json())
    .then(data => {
		this.networks = data.filter(v=>v.ssid!="");
        });

	this.hostname = location.hostname;

  },
  methods: {
		onChange: function(event) {
			this.security = event.target.options[event.target.options.selectedIndex].dataset.security;
		}, 
		toggleVisibility() {
			this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
		},
		connect() {
				var data = new FormData();
				data.append("ssid", this.selected.ssid );
				data.append("identity", this.selected.identity );
				data.append("passphrase", this.selected.password );
				fetch(`http://192.168.42.1/wifi-connect/connect`, {
						"method": "POST",
						"mode": "cors",
						"body": data})
						.then(console.log("send"))
						.then(data => {
                                                       alert( this.$i18n.t('settings.wifi_connected') );
						});

		}

  }
};
</script>

