window.addEventListener('load', function() {
    var editor;

    editor = ContentTools.EditorApp.get();
    editor.init('*[data-editable]', 'data-name');

    editor.addEventListener('saved', function (ev) {
        var name, payload, regions, xhr;
    
        // Check that something changed
        regions = ev.detail().regions;
        if (Object.keys(regions).length == 0) {
            return;
        }
    
        // Set the editor as busy while we save our changes
        this.busy(true);
		
        payload = [];
        for (name in regions) {
            if (regions.hasOwnProperty(name)) {
                payload.push({name: regions[name]});
            }
        }
    
		$.post( "/save-my-page", payload, function( data ) {
			editor.busy(false);
			if (data == "200") new ContentTools.FlashUI('ok');
			else new ContentTools.FlashUI('no');
		});
    });
});

