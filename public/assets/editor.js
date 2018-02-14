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
			if (data == "200") new ContentTools.FlashUI('ok');
			else new ContentTools.FlashUI('no');
		}, "json");
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
    var customTools = document.getElementsByClassName("custom-tool");
    for (var elem of customTools)  {
        elem.onmousedown = function(e){

            e = e || window.event
            e.preventDefault();
    
            var element = ContentEdit.Root.get().focused();
            var domElement = window.getSelection().anchorNode.parentElement;
    
            ContentSelect.Range.prepareElement(domElement);
            selection = ContentSelect.Range.query(domElement);
            
            var bold = ContentTools.ToolShelf.fetch(this.id);
            bold.apply(element,selection,function(){});
        }
    };

}
