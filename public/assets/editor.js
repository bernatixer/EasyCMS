function startEditor() {
    console.log("Editor Start");

    var editor;

    editor = ContentTools.EditorApp.get();
    editor.init('*[data-editable]', 'data-name', null, false);

    editor.start();
    //editor.ignition().hide();
    editor.inspector().hide();
    editor.toolbox().hide();

    //Render adminNavbar    
    $.get("admin-navbar",function(data){
        $('#admin-navbar').append(data);
        $('body').addClass("has-navbar-fixed-top");
    });

    $('#admin-navbar').ready(function(){

        editor.addEventListener('saved', function (ev) {
            var name, payload, regions, xhr;
        
            // Check that something changed
            regions = ev.detail().regions;
            if (Object.keys(regions).length == 0) {
                return;
            }
            
            // Set the editor as busy while we save our changes
            $("#savingPage").addClass("is-active");
            this.busy(true);
            
            payload = {__name__: window.location.pathname};
            for (name in regions) {
                if (regions.hasOwnProperty(name)) {
                    payload[name] = regions[name];
                }
            }
    
            $.post( "/save-my-page", payload, function( data ) {
                $("#savingPage").removeClass("is-active");
                editor.busy(false);
                if (data == "ok") new ContentTools.FlashUI('ok');
                else new ContentTools.FlashUI('no');
            });
        });      
        
        console.log($('saveButton'));
    
        //Set save Button
        $('#saveButton').click(function(e){
            editor.save(true);
        });
    
        //Right Click prevent default    
        $(document).contextmenu(function(e){
            e.preventDefault();
        })
    
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

        //---------New Tab--------------
        //Opens modal 
        $("#newTab").click(function() {
            $("#newTabModal").addClass("is-active");
        });
        
        //Close modal 
        $(".modal-close").click(function() {
            $("#newTabModal").removeClass("is-active");
        });
        
        //Close modal
        $(".modal-background").click(function() {
            $("#newTabModal").removeClass("is-active");
        });
        
        //Close Modal 
        $(".modal-cancel").click(function() {
            $("#newTabModal").removeClass("is-active");
        });
        
        //Create Tab
        $("#createTab").click(function() {
            $("#newTabModal").removeClass("is-active");
            socket.emit('createTab', {
                name: $('#tabName').val()
            });
        });
        //------------------------------
    });    
};

//Call to apply tool = toolToApply
function applyTool(toolToApply){
    var element = ContentEdit.Root.get().focused();
    var domElement = element.domElement();

    ContentSelect.Range.prepareElement(domElement);
    selection = ContentSelect.Range.query(domElement);    

    var tool = ContentTools.ToolShelf.fetch(toolToApply);
    tool.apply(element,selection,function(){});
} 

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
        // Set the dialog to busy while the rotate is performed
        dialog.busy(true);

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