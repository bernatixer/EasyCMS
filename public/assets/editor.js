window.addEventListener('load', function() {
    var editor;

    editor = ContentTools.EditorApp.get();
    editor.init('*[data-editable]', 'data-name', null, false);

    //Right Click
    if (document.addEventListener) { // IE >= 9; other browsers
        document.addEventListener('contextmenu', function(e) {
            openToolbox();
            e.preventDefault();
        }, false);
    } else { // IE < 9
        document.attachEvent('oncontextmenu', function() {
            openToolbox();
            window.event.returnValue = false;
        });
    }

    editor.addEventListener('saved', function (ev) {
        var name, payload, regions, xhr;
    
        // Check that something changed
        regions = ev.detail().regions;
        if (Object.keys(regions).length == 0) {
            return;
        }
    
        // Set the editor as busy while we save our changes
        this.busy(true);
		
        payload = {};
        for (name in regions) {
            if (regions.hasOwnProperty(name)) {
				payload[name] = regions[name];
            }
        }

		$.post( "/save-my-page", payload, function( data ) {
            editor.busy(false);
            if (data == "ok") new ContentTools.FlashUI('ok');
            else new ContentTools.FlashUI('no');
        });
    });

    function openToolbox(){
        
        if(editor.isReady()){
            editor.start();        
            editor.inspector().hide();
        }else if(editor.isEditing()){
            editor.stop(true);
        }
          
    }
});

window.onload = function(){
    var customTools = document.querySelectorAll("[custom-tool]");
    for (var elem of customTools)  {
        elem.onmousedown = function(e){
            
            e = e || window.event
            e.preventDefault();
    
            var element = ContentEdit.Root.get().focused();
            var domElement = window.getSelection().anchorNode.parentElement;
    
            ContentSelect.Range.prepareElement(domElement);
            selection = ContentSelect.Range.query(domElement);

            var useTool = this.getAttribute("custom-tool");

            console.log(useTool + " tool click");

            var tool = ContentTools.ToolShelf.fetch(useTool);
            tool.apply(element,selection,function(){});
        }
    };
}

window.imageUploader = function(dialog){
    var image;

    dialog.addEventListener('imageuploader.clear', function () {
        // Clear the current image
        dialog.clear();
        image = null;
		$.get('/upload/cancel');
    });

    dialog.addEventListener('imageuploader.fileready', function (ev) {
        // Upload a file to the server
        var formData;
        var file = ev.detail().file;

        // Set the dialog state to uploading and reset the progress bar to 0
        dialog.state('uploading');
        // dialog.progress(0);
		// TO-DO: PUT A LOADING GIF

        // Build the form data to post to the server
        formData = new FormData();
        formData.append('image', file);

		$.ajax({
			url: '/upload',
			data: formData,
			contentType: false,
			processData: false,
			type: 'POST',
			'success': function(data){
				var response = JSON.parse(data);
				image = response;
				dialog.populate('http://localhost:3000/temp/'+response.url, [600, 600]);
			}
		});
    });
	
    dialog.addEventListener('imageuploader.save', function () {
        var crop, cropRegion, formData;

        // Set the dialog to busy while the rotate is performed
        dialog.busy(true);

        // Build the form data to post to the server
        formData = new FormData();
        formData.append('url', image.url);

        // Set the width of the image when it's inserted, this is a default
        // the user will be able to resize the image afterwards.
        formData.append('width', 600);

        // Check if a crop region has been defined by the user
        if (dialog.cropRegion()) {
            formData.append('crop', dialog.cropRegion());
        }

		$.get('/upload/confirm', function(data) {
			dialog.busy(false);
			dialog.save(
				data,
				[600, 600],
				{
					'alt': "Change me!",
					'data-ce-max-width': 600
				}
			);
		});
    });
}

ContentTools.IMAGE_UPLOADER = imageUploader;