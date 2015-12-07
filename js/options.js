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

function storageLocalSet(setData, data) {
  chrome.storage.local.set(setData, function() {
    if(data && data.oldValue && data.newValue) {
      console.log('Volume changed from ' + data.oldValue + ' to ' + data.newValue);
    }
    else {
      if(setData.volume) {
        console.log('Local storage volume = ' + setData.volume + '.');
      }
      console.log('Local storage sync = ' + setData.sync + '.');
    }
  });
}

function storageSyncSet(setData, data) {
  chrome.storage.sync.set({volume: setData.volume}, function() {
    if(data && data.oldValue && data.newValue) {
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
        $volumeInput = $("#volume-input"),
        $volumeSyncInput = $('#volume-sync-input');

    //Translate:
    $('#options-page-title').html(_t.OPTIONS["SETTING_HEAD_TITLE"]);
    $('#setting-title').html(_t.OPTIONS["SETTING_TITLE"] + ':');
    $('#volume-option').html(_t.OPTIONS["VOLUME_OPTION"]);
    $('#volume-sync-option').html(_t.OPTIONS["VOLUME_SYNC_VALUE"]).attr('title', _t.OPTIONS["VOLUME_SYNC_TITLE_ATTR"]);
    $('#resetBtn').html(_t.OPTIONS["RESET_BUTTON"]);
    $('#copyright').html(date.getFullYear() + ' ' + _t.OPTIONS["COPYRIGHT_TEXT"] + ' - ');

    function initSliderVolumeCbk(data) {
      var volumeSliderValue = 70;
          byDefaultText = 'By Default.';
      if(data && data.volume) {
        volumeSliderValue = data.volume * 100;
        byDefaultText = '';
      }
      console.log('Init Setting volume to ' + volumeSliderValue + '. ' + byDefaultText);

      //Showing the page when the translate and the volume are loaded.
      showPage();

      $volumeInput.slider({
        id: 'volumeSlider',
        min: 0,
        max: 100,
        step: 1,
        value: volumeSliderValue,
        tooltip: 'always'
      });
    }

    function initCheckboxToogle(checkboxValue) {
      //Init checkbox toogle.
      $volumeSyncInput.prop('checked', checkboxValue);
      $volumeSyncInput.bootstrapToggle(
        {
          on: _t.OPTIONS['CHECKBOX_ON_TEXT'],
          off: _t.OPTIONS['CHECKBOX_OFF_TEXT'],
          size: 'small'
        }
      );
      console.log('Init Checkbox in ' + checkboxValue + ' value.');
    }

    chrome.storage.local.get('sync', function(response) {
      if(response.sync) {
        console.log('Loading Volume from SYNC Storage.');
        chrome.storage.sync.get('volume', initSliderVolumeCbk);
        initCheckboxToogle(true);
      }
      else {
        console.log('Loading Volume from LOCAL Storage.');
        chrome.storage.local.get('volume', initSliderVolumeCbk);
        initCheckboxToogle(false);
      }
    });

    $volumeInput.change(function(data){
      var volumeValue = data.value.newValue / 100;

      chrome.storage.local.get('sync', function(response) {
        var sendData = {
              volume: volumeValue
            },
            dataObj = {
              oldValue: data.value.oldValue,
              newValue: data.value.newValue
            };

        if(response.sync) {
          storageSyncSet(sendData, dataObj);
        }
        else {
          storageLocalSet(sendData, dataObj);
        }
      });
    });

    $volumeSyncInput.change(function(element) {
      var volumeValue = $volumeInput.slider('getValue') / 100;
;
      if(element.target.checked) {
        storageSyncSet({volume: volumeValue});
        storageLocalSet({sync: true});
        console.log('Checked to true and volume ' + volumeValue + ' saving in SYNC storage.');
      }
      else {
        storageLocalSet({volume: volumeValue, sync: false});
        console.log('Checked to false. Using LOCAL storage with volume in ' + volumeValue + '.');
      }
    })

    $('#resetBtn').click(function() {
      $volumeInput.slider('setValue', 70);
      storageLocalSet({volume: 0.7, sync: false});
      if($volumeSyncInput.is(':checked')) {
        $volumeSyncInput.bootstrapToggle('toggle');
      }
      console.log('Sent Volume RESET to 70');
      console.log('Sent Sync RESET to false');
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
      for (key in changes) {
        var storageChange = changes[key];
        if(namespace === 'sync') {
          if(key === 'volume' && $volumeSyncInput.is(':checked')) {
            var updateVolumeValue = storageChange.newValue * 100;
            $volumeInput.slider('setValue',  updateVolumeValue);
            console.log('Updating slider Volume by Sync to ' + updateVolumeValue);
          } else {
            console.log('Sync update is called but not applied in slider because is Local.');
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
