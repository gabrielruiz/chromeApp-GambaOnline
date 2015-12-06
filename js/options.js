function showPage() {
  $('body').show();
}

function init() {
	var ln = window.navigator.language || navigator.browserLanguage,
      lang;
	if (ln.match(/en\-.+/)) {
		lang = 'en-US';
	}
	else {
		lang = 'es-AR';
	}
	return $.getJSON('../languages/' + lang +'.json');
}

function storageLocalSet(data) {
  chrome.storage.local.set({ volume: data.volume, sync: data.sync }, function() {
    if(data.oldValue && data.newValue) {
      console.log('Volume changed from ' + data.oldValue + ' to ' + data.newValue);
    }
    else {
      console.log('Local storage volume set to ' + data.volume + '.');
      console.log('Local storage setting sync = ' + data.sync + '.');
    }
  });
}

function storageSyncSet(data) {
  chrome.storage.sync.set({volume: data.volume}, function() {
    if(data.oldValue && data.newValue) {
      console.log('Sync storage saved. Old value: ' + data.oldValue + ' |  New Value: ' + data.newValue);
    }
    else {
      console.log('Sync storage saved.');
    }
  });
}

$(document).ready(function() {
  init().then(function(value) {

    var _t = value,
        date = new Date(),
        $volumeValue = $("#volume-value"),
        $volumeSyncValue = $('#volume-sync-value');

    //Translate:
    $('#options-page-title').html(_t.OPTIONS["SETTING_PAGE_TITLE"]);
    $('#setting-title').html(_t.OPTIONS["SETTING_TITLE"] + ':');
    $('#volume-option').html(_t.OPTIONS["VOLUME_OPTION"]);
    $('#volume-sync-option').html(_t.OPTIONS["VOLUME_SYNC_VALUE"]);
    $('#volume-sync-value').attr('title', _t.OPTIONS["VOLUME_SYNC_TITLE_ATTR"]);
    $('#resetBtn').html(_t.OPTIONS["RESET_BUTTON"]);
    $('#copyright').html(date.getFullYear() + ' ' + _t.OPTIONS["COPYRIGHT_TEXT"] + ' - ');


    function setSliderVolume(data) {
      var volumeSliderValue = data.volume;

      if(typeof volumeSliderValue === 'undefined') {
        volumeSliderValue = 70;
      }
      else if(volumeSliderValue > 0) {
        volumeSliderValue = volumeSliderValue * 100;
        $volumeSyncValue.attr('checked', true);
      }

      //Showing the page when the translate and the volume are loaded.
      showPage();

      $volumeValue.slider({
        id: 'volumeSlider',
        min: 0,
        max: 100,
        step: 1,
        value: volumeSliderValue,
        tooltip: 'always'
      });

    }

    chrome.storage.local.get('sync', function(response) {
      if(typeof response.sync === 'undefined' || response.sync) {
        console.log('Loading Volume from Sync Storage.');
        chrome.storage.sync.get('volume', setSliderVolume);
      }
      else {
        console.log('Loading Volume from Local Storage.');
        chrome.storage.local.get('volume', setSliderVolume);
      }
    });

    $volumeValue.bind('change', function(data){
      var volumeValue = data.value.newValue / 100;

      chrome.storage.local.get('sync', function(response) {
        var sendData = {
              volume: volumeValue,
              oldValue: data.value.oldValue,
              newValue: data.value.newValue
            };

        if(response.sync) {
          storageSyncSet(sendData);
          sendData.sync = true;
          storageLocalSet(sendData);
        }
        else {
          sendData.sync = false;
          storageLocalSet(sendData);
        }
      });
    });

    $volumeSyncValue.bind('change',function(element) {
      var volumeValue = $volumeValue.slider('getValue') / 100,
          sendData = {
            volume: volumeValue
          };
      if(element.target.checked) {
        storageSyncSet(sendData);
        sendData.sync = true;
        storageLocalSet(sendData);
      }
      else {
        sendData.sync = false;
        storageLocalSet(sendData);
      }
    })

    $('#resetBtn').click(function() {
      $volumeValue.slider('setValue', 70);
      if($volumeSyncValue.is(':checked')) {
        $volumeSyncValue.click();
      }
      console.log('Sent Volume reset to 70');
      console.log('Sent Sync reset to false');
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
      for (key in changes) {
        var storageChange = changes[key];
        if(namespace === 'sync') {
          if(key === 'volume' && $volumeSyncValue.is(':checked')) {
            var updateVolumeValue = storageChange.newValue * 100;
            $volumeValue.slider('setValue',  updateVolumeValue);
            console.log('Update Volume by Sync to ' + updateVolumeValue);
          } else {
            console.log('Sync update is called but not applied.');
          }
          console.log('Storage key "%s" in namespace "%s" changed. ' +
                      'Old value was "%s", new value is "%s".',
                      key,
                      namespace,
                      storageChange.oldValue,
                      storageChange.newValue);
        }
      }
    });
  });
});
