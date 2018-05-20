var userToken = "";

$('#confirmar').on('click', function() {
    var total = 0;
    var texto = "";

    $('.collection-item .badge').each(function(){

    if($(this).text() != 0) { 
           
            var produto = $(this).parent(".add").siblings("#titulo").text();
            var quantidade =  parseInt($(this).text());
            texto += "<div> - " + produto + ": " + quantidade + "</div>";

            var valor =  $(this).parent(".add").siblings("#valor").text();
            valor = parseFloat(valor.split("R$")[1].replace(',','.'));
            total = parseFloat(total) + parseFloat(valor * quantidade);
        }

    });



    $('#resumo').html(texto);
    $('#total').html("Total: R$" + total.toFixed(2).toString().replace(".",","));
});


$('.acao-limpar').on('click', function() {
    $('.badge').text("0");
    $('.remove').html("");
});

$('.scan-qrcode').click(function(){
    scanQrcode();
});

$('.acao-finalizar').click(function(){
    if($('#numero-mesa').val() != "") {
        novoPedido();
    }
    else {
         Materialize.toast("Escaneie o QRCode para identificar sua mesa.", 2000, 'red-text', function() {scanQrcode(true)});
     }
});

$('.acao-cadastro').click(function() {
    userToken = window.location.href.split("?token=")[1];
    $.ajax({
        url: 'http://pedder.meteorapp.com/novo-usuario',
        data: {
            nome: $('#nome').val(), 
            login: $('#login').val(),
            senha: $('#password').val()
        },
        success: function(resposta){
            resposta = JSON.parse(resposta);

            if(resposta[0].status == "error")
                Materialize.toast(resposta[0].msg, 2000, 'red-text');
            else
                window.location="paginaInicial.html?token=" + userToken + "&userId=" + resposta[0].usuario._id;
        },
        error: function(erro){
            var erroJson = JSON.parse(erro.responseText);
            if($('.toast').length == 0)
                Materialize.toast(erroJson[0].msg, 3000, 'red-text');
        }
    })
});

$('.acao-login').click(function() {
    userToken = $('#token').val();
    $.ajax({
        url: 'http://pedder.meteorapp.com/loga-usuario',
        data: {
            login: $('#login').val(),
            senha: $('#password').val()
        },
        success: function(resposta){
            resposta = JSON.parse(resposta);
            if(resposta[0].status == "error" && $('.toast').length == 0) 
               Materialize.toast(resposta[0].msg, 2000, 'red-text');
            else
                window.location="paginaInicial.html?token=" + userToken + "&userId=" + resposta[0].usuario._id;

        },
        error: function(erro){
            if($('.toast').length == 0)
                Materialize.toast(erro.responseText, 3000, 'red-text');
        }
    });
});

$('a[href="#meusPedidos"]').click(function() {
    meusPedidos();
});

$('.redirectCadastro').click(function(){
    userToken = $('#token').val();
    window.location="cadastro.html?token=" + userToken;
});



function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
    window.plugins.PushbotsPlugin.initialize("5ae2632e1db2dc0baa09c7a3", {"android":{"sender_id":"989712426350"}});
    // Only with First time registration
    window.plugins.PushbotsPlugin.on("registered", function(token){
        console.log("Registration Id:" + token);
    });

    //Get user registrationId/token and userId on PushBots, with evey launch of the app even launching with notification
    window.plugins.PushbotsPlugin.on("user:ids", function(data){
        console.log("user:ids" + JSON.stringify(data));
        $('#token').val(data.token);
    });
}

function scanQrcode(blnFazPeido) {
    cordova.plugins.barcodeScanner.scan(function(resultado){
        if (resultado.text) {
            $('#numero-mesa').val(resultado.text);
            $('#lblMesa').text("Mesa: " + resultado.text);

            if(blnFazPeido)
                novoPedido();
            else
                Materialize.toast('Mesa ' + resultado.text, 2000);
        }
    },
    function(erro) {
        Materialize.toast('Erro ' + erro, 2000, 'red-text');
    });
}

function meusPedidos(){
    $.ajax({
        url: 'http://pedder.meteorapp.com/lista-pedido',
        data: {
            userId: window.location.href.split("&userId=")[1]
        },
        success: function(resposta){
            resposta = JSON.parse(resposta);
            var html = "";
            if(resposta[0].pedidos.length > 0) {
                $("#meusPedidos").html("");
                for(var i = 0; i < resposta[0].pedidos.length; i++) {
                    html += '<div class="collection">';
                    html += '   <a class="collection-item  black-text">';
                    html +=     resposta[0].pedidos[i].ativo ? '<p class="green-text noMargin B">Preparando</p>' : '<p class="red-text noMargin B">Finalizado</p>';
                    html +=     '<p class="noMargin">' + resposta[0].pedidos[i].itens.split(' -').join('</br>') + '</p>';
                    html +=     '<p> Total: R$' + resposta[0].pedidos[i].preco + '</p>';
                    html += '   </a>';
                    html += '</div>';
                }
            }
            else {
                 html += '<div class="collection noBorder">';
                 html += '   <div class="collection-item noRowMessage">';
                 html += '     <h5 class="B">Você ainda não fez nenhum pedido</h5>';
                 html += '   </div>';
                 html += '</div>';
            }
            $("#meusPedidos").html(html);
        },
        error: function(erro){
            Materialize.toast(erro.responseText, 3000, 'red-text');
        }
    });
}

function novoPedido() {
    $.ajax({
        url: 'http://pedder.meteorapp.com/novo-pedido',
        data: {
            mesa: $('#numero-mesa').val(),
            pedido: $('#resumo').text(),
            userToken: window.location.href.split("?token=")[1].split("&")[0],
            userId: window.location.href.split("&userId=")[1],
            preco: $('#total').text().split("R$")[1]
        },
        success: function(resposta){
            Materialize.toast(resposta, 2000, 'green-text');     
            $('.badge').text("0");
            $('.remove').html("");
        },
        error: function(erro){
           Materialize.toast(erro.responseText, 3000, 'red-text');
        }
    });
}

function cardapio() {
    $.ajax({
        url: 'http://pedder.meteorapp.com/produtos',
        success: function(resposta){
            var html = "";
            html += '<div class="collection">';
            for(var i=0; i < resposta[0].produtos.length; i++) {
                html += '<a class="collection-item black-text">';
                //html += '   <p class="remove"></p>';
                html += '   <p class="add">';
                html += '       <span class="btn-add btn-floating btn-small waves-effect waves-light green darken-2"><i class="material-icons">add</i></span>';
                html += '       <span class="badge red-text">0</span>';
                html += '       <span class="btn-remove btn-floating btn-small waves-effect waves-light red darken-4"><i class="material-icons">remove</i></span>';
                html += '   </p>';
                html += '   <img src="' + resposta[0].produtos[i].image + '"/>';
                html += '   <p id="titulo">' + resposta[0].produtos[i].nome + '</p>';
                html += '   <p class="descricao">' + resposta[0].produtos[i].descricao + '</p>';
                html += '   <p id="valor">R$' + parseFloat(resposta[0].produtos[i].preco.replace(',','.')).toFixed(2).replace('.', ',').toString() + '</p>';
                html += '</a>';
            }

            html += '</div>';

            $('#cardapio div').remove();
            $('#cardapio').html(html);

            $('.btn-add').on('click', function(){
                //var $badge = $('.badge', this);
                var $badge = $(this).siblings('.badge');
                

                if($badge.text() == "") {
                    $badge.text(0 + 1);
                }
                else        
                    $badge.text(parseInt($badge.text()) + 1); 
            });

            $('.btn-remove').on('click', function(){
                //var $badge = $('.badge', this);
                var $badge = $(this).siblings('.badge');

                if($badge.text() > 0) 
                    $badge.text(parseInt($badge.text()) - 1); 
            });


        }
    });
}

$('.modal-trigger').leanModal();