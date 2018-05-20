$('.collection-item').on('click', function(){

    var $badge = $('.badge', this);

    /*if($badge.text() == "")
        $badge.text(0 + 1);
    else        
        $badge.text(parseInt($badge.text()) + 1); */

    /*var $badge = $('.badge', this);
    if($badge.length == 0) {
       $badge = $('<span class="badge red-text">0</span>').appendTo(this);
	}

	$badge.text(parseInt($badge.text()) + 1);*/
});

$('#confirmar').on('click', function() {
    
    var texto = "";

 	$('.badge').parent().each(function() {
 		var produto = this.firstChild.textContent;
 		var quantidade = this.lastChild.textContent;

 		texto += produto + ": " + quantidade + "\n";
    });

    $('#resumo').text(texto);
});

$('.collection').on('click', '.badge', function(){
    $(this).remove();
    return flse;
});

$('.acao-limpar').on('click', function() {
    $('#numero-mesa').val('');
    $('.badge').remove();
});

$('.modal-trigger').leanModal();