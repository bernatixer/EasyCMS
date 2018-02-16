ContentTools.Tools.Justify = (function(_super){
    __extends(Justify, _super);
  
    function Justify(){
      return Justify.__super__.constructor.apply(this,arguments);
    }

    ContentTools.ToolShelf.stow(Justify, 'justify');

    Justify.label = 'Justify';
    Justify.icon = 'justify';
    Justify.className = 'has-text-justified';

})(ContentTools.Tools.AlignLeft);