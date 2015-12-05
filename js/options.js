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

$(document).ready(function() {
  init().then(function(value) {

    var _t = value,
        date = new Date(),
        $volumeValue = $("#volume-value");

    //Translate:
    $('#options-page-title').html(_t.OPTIONS["SETTING_PAGE_TITLE"]);
    $('#setting-title').html(_t.OPTIONS["SETTING_TITLE"] + ':');
    $('#volume-option').html(_t.OPTIONS["VOLUME_OPTION"]);
    $('#resetBtn').html(_t.OPTIONS["RESET_BUTTON"]);
    $('#copyright').html(date.getFullYear() + ' ' + _t.OPTIONS["COPYRIGHT_TEXT"] + ' - ');


    chrome.storage.local.get('volume', function(data) {
      var volumeSliderValue = data.volume;

      if(typeof volumeSliderValue === 'undefined') {
        volumeSliderValue = 70;
      }
      else if(volumeSliderValue > 0) {
         volumeSliderValue = volumeSliderValue * 100;
      }

      $volumeValue.slider({
        id: 'volumeSlider',
        min: 0,
        max: 100,
        step: 1,
        value: volumeSliderValue,
        tooltip: 'always'
      });

      //Showing the page when the Translate and the Slider are loaded.
      showPage();

    });

    $volumeValue.bind('change', function(data){
      var volumeValue = data.value.newValue / 100;
      chrome.storage.local.set({volume: volumeValue}, function() {
        console.log('Volume changed from ' + data.value.oldValue + ' to ' + data.value.newValue);
      });
    });

    $('#resetBtn').click(function() {
      chrome.storage.local.set({volume: 0.7}, function(data) {
        var oldValue = $volumeValue.slider('getValue');
        $volumeValue.slider('setValue', 70);
        console.log('Volume reset from ' + oldValue + ' to 70');
      });
    });
  });
});
