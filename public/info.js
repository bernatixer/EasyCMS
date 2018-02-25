adminNavbar = {
    getBaseHtml: function(){
        return `<nav class="navbar is-fixed-top" id="toolbar" role="navigation" aria-label="main navigation">
                    <div class="navbar-brand">
                        <a class="navbar-item publish">
                            <strong>PUBLISH</strong>
                        </a>
                        <a class="navbar-item newTab" id="newTab">
                            <strong><i class="fas fa-plus"></i> TAB </strong>
                        </a>
                        <a class="navbar-item save" id="saveButton">
                            <strong><i class="fas fa-save"></i> SAVE</strong>
                        </a>
                        <button class="button navbar-burger">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                    <div class="navbar-end toolbar">
                    </div>
                </nav>`
    },
    tools: {
        holderClass:".toolbar",
        bold: {
            name: "Bold",
            fa: '<i class="fas fa-bold"></i>'
        },
        italic: {
            name:"Italic",
            fa:'<i class="fas fa-italic"></i>'
        },
        link: {
            name:"Link",
            fa:'<i class="fas fa-link"></i>'
        },
        heading: {
            name:"Heading",
            fa:'<i class="fas fa-heading"></i>'
        },
        subheading: {
            name:"Sub Heading",
            fa:'<i class="fas fa-heading fa-sm"></i>'
        },
        paragraph: {
            name:"Paragraph",
            fa: '<i class="fas fa-paragraph"></i>'
        },
        preformatted: {
            name:"Preformatted",
            fa: '<i class="fas fa-code"></i>'
        },
        align_left: {
            name:"Align Left",
            fa:'<i class="fas fa-align-left"></i>'
        },
        align_center: {
            name:"Align Center",
            fa:'<i class="fas fa-align-center"></i>'
        },
        align_right: {
            name: "Align Righht",
            fa:'<i class="fas fa-align-right"></i>'
        },
        align_justify:{
            name:"Align Justify",
            fa:'<i class="fas fa-align-justify"></i>'
        },
        unordered_list: {
            name:"Unordered List",
            fa:'<i class="fas fa-list-ul"></i>'
        },
        ordered_list: {
            name:"Ordered List",
            fa: '<i class="fas fa-list-ol"></i>'
        },
        table: {
            name: "Table",
            fa: '<i class="fas fa-table"></i>'
        },
        indent: {
            name: "Indent",
            fa: '<i class="fas fa-indent"></i>'
        },
        unindent: {
            name: "Unindent",
            fa: '<i class="fas fa-outdent"></i>'
        },
        line_break: {
            name: "Line Break",
            contentIcon: "\ea6e" 
        },
        image: {
            name: "Image",
            fa: '<i class="fas fa-image"></i>'
        },
        video: {
            name: "Video",
            fa: '<i class="fas fa-video"></i>'
        },
        undo: {
            name: "Undo",
            fa: '<i class="fas fa-undo"></i>'
        },
        redo: {
            name: "Redo",
            fa: '<i class="fas fa-redo"></i>'
        },
        remove: {
            name: "Delete",
            fa: '<i class="fas fa-trash-alt"></i>'
        }
    },
};