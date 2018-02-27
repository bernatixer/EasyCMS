function startEditor() {

    var editor;
    // ALLTOOLS = ['bold', 'italic', 'link', 'align-left', 'align-center', 'align-right', 'align-justify','heading', 'subheading', 'paragraph', 'unordered-list', 'ordered-list', 'table', 'indent', 'unindent', 'line-break','image', 'video', 'preformatted','undo', 'redo', 'remove'];
    const TOOLS = ['bold', 'italic', 'link', 'align-left', 'align-center', 'align-right', 'align-justify','heading', 'subheading', 'paragraph', 'unordered-list', 'ordered-list', 'table', 'indent', 'unindent', 'line-break','image', 'video', 'preformatted','undo', 'redo', 'remove'];
    editor = ContentTools.EditorApp.get();
    editor.init('*[data-editable]', 'data-name', null, false);

    editor.start();
    editor.inspector().hide();
    //editor.toolbox().hide();

    $('#navbarContent').prepend(adminNavbar.getBaseHtml);
    $('body').addClass("has-navbar-fixed-top");
    var toolsCollection = adminNavbar.tools;
    TOOLS.forEach(elem => {
        var elemReplaced = elem.replace(/-/g, "_");
        if(toolsCollection[elemReplaced]){
            var tool = $('<a custom-tool="'+elem+'" class="navbar-item custom-'+elem+'"></a>')
            $(toolsCollection.holderClass).append(tool);
            var icon = toolsCollection[elemReplaced]["fa"];
            if(icon) tool.append(icon);
            else{
                icon = toolsCollection[elemReplaced]["contentIcon"];
                if(icon) tool.css({"content": icon});
            }
        }
    }); 

    $('#admin-navbar').ready(function(){
        //SetInterval for update Tools
        this._updateTools = (function(_this) {   
            return function() {           
                var element,  selection, update, _results;
                update = false;
                element = ContentEdit.Root.get().focused();
                selection = null;
                if (element == _this._lastUpdateElement) {
                    if (element && element.selection) {
                        selection = element.selection();
                        if (_this._lastUpdateSelection) {
                            if (!selection.eq(_this._lastUpdateSelection)) {
                            update = true;
                            }
                        } else {
                            update = true;
                        }
                    }
                } else {
                    update = true;
                }
                if (editor.history) {
                    if (_this._lastUpdateHistoryLength !== editor.history.length()) {
                        update = true;
                    }
                    _this._lastUpdateHistoryLength = editor.history.length();
                    if (_this._lastUpdateHistoryIndex !== editor.history.index()) {
                        update = true;
                    }
                    _this._lastUpdateHistoryIndex = editor.history.index();
                }
                _this._lastUpdateElement = element;
                _this._lastUpdateSelection = selection;

                if (update) {
                    _results = [];
                    TOOLS.forEach(elem => {
                        _results.push(changeToolState(elem,element,selection));
                    });               
                    return _results;
                }
            };
        })(this);
        this._updateToolsInterval = setInterval(this._updateTools, 100);

        //Save Event
        editor.addEventListener('saved', function (ev) {
            var name, payload, regions;
        
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

    //Get element Selected (not Dom)
    function getElementToApply(){
        return ContentEdit.Root.get().focused();
    }

    //Get Range of selection
    function getSelectionToApply(element){
        var domElement = element.domElement();
        ContentSelect.Range.prepareElement(domElement);
        return ContentSelect.Range.query(domElement);
    }

    //Call to apply tool = toolToApply
    function applyTool(toolToApply){
        var element = getElementToApply();
        var selection = getSelectionToApply(element);    

        var tool = ContentTools.ToolShelf.fetch(toolToApply);
        tool.apply(element,selection,function(){});
    }

    //Change Tool State depending if can be applied, its applied or not
    function changeToolState(toolToApply,element,selection){
        var tool = ContentTools.ToolShelf.fetch(toolToApply);
        var attr = '[custom-tool='+toolToApply+']';
        if (tool.requiresElement) {
            if (!(element && element.isMounted())) {
                return $(attr).css({"display":"none"});
            }
        }

        if(tool.canApply(element,selection)){
            $(attr).css({"display":"block"});
        }else{
            return  $(attr).css({"display":"none"});
        }
        
        if(tool.isApplied(element,selection)){
            return $(attr).addClass("custom-applied");
        }else{
            return $(attr).removeClass("custom-applied");
        }
    }        
};



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

$('#tabName').keypress(function (e) {
  if (e.which == 13) {
	$("#newTabModal").removeClass("is-active");
	socket.emit('createTab', {
		name: $('#tabName').val()
	});
    return false;
  }
});