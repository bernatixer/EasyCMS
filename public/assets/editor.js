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
		
        payload = {__name__: window.location.pathname};
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

//Call to apply tool = toolToApply
function applyTool(toolToApply){
    var element = ContentEdit.Root.get().focused();
    var domElement = element._domElement;

    ContentSelect.Range.prepareElement(domElement);
    selection = ContentSelect.Range.query(domElement);    

    var tool = ContentTools.ToolShelf.fetch(toolToApply);
    tool.apply(element,selection,function(){});
}

//Ctrl + z = undo, ctrl Y = redo
$(document).keydown(function(e){
    if( e.which === 90 && e.ctrlKey){
       console.log('control + z'); 
       applyTool("undo");
    }
    else if( e.which === 89 && e.ctrlKey ){
       console.log('control + y'); 
       applyTool("redo");
    }          
}); 

//Set toolbar buttons function
$('[custom-tool]').mousedown(function(e){
    e = e || window.event
    e.preventDefault();
    
    var useTool = this.getAttribute("custom-tool");
    applyTool(useTool);
});


window.imageUploader = function(dialog){
    var image;

    dialog.addEventListener('imageuploader.clear', function () {
        dialog.clear();
        image = null;
		$.get('/upload/cancel');
    });

    dialog.addEventListener('imageuploader.fileready', function (ev) {
        var formData;
        var file = ev.detail().file;

        dialog.state('uploading');
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
				dialog.populate('http://localhost:3000/temp/'+image.url, image.size);
			}
		});
    });
	
    dialog.addEventListener('imageuploader.save', function () {
        var crop, cropRegion, formData;

        // Set the dialog to busy while the rotate is performed
        dialog.busy(true);

        // Check if a crop region has been defined by the user
        if (dialog.cropRegion()) {
            formData.append('crop', dialog.cropRegion());
        }

		$.get('/upload/confirm', function(data) {
			dialog.busy(false);
			dialog.save(
				data,
				image.size,
				{
					'alt': "Change me!",
					'data-ce-max-width': image.size[0]
				}
			);
		});
    });
}

ContentTools.IMAGE_UPLOADER = imageUploader;