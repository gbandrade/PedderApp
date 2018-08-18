var userToken = "";

$('#confirmar').on('click', function(e) {
    if (!$(this).hasClass("disabled")) {
        var total = 0;
        var texto = "";

        $('.collection-item .badge').each(function() {
            if (parseInt($(this).text()) > 0) {

                var produto = $(this).parent().parent().parent().find(".title").text();
                var quantidade = parseInt($(this).text());
                texto += "<div>" + produto + ": " + quantidade + "<br></div>";

                var valor = $(this).parent().parent().parent().find("#valor").text();
                valor = parseFloat(valor.split("R$")[1].replace(/\./g, '').replace(',', '.'));
                total = parseFloat(total) + parseFloat(valor * quantidade);
            }
        });

        $('#resumo').html(texto);
        $('#total').html("Total: " + total.toLocaleString('pt-BR', { minimumFractionDigits: 2 , style: 'currency', currency: 'BRL' }));
    } else {
        e.preventDefault();
        $(this).off("click").attr('href', 'javascript: void(0)');
    }
});

$('.acao-limpar').on('click', function() {
    $('.badge').text("0");
});

$('.scan-qrcode').click(function() {
    scanQrcode();
});

$('.acao-finalizar').click(function() {
    if ($('#numero-mesa').val() != "") {
        novoPedido();
    } else {
        Materialize.toast("Escaneie o QRCode para identificar sua mesa.", 2000, 'red-text', function() {
            scanQrcode(true)
        });
    }
});

$('.acao-cadastro').click(function() {
    //userToken = window.location.href.split("?token=")[1];]
    userToken = window.localStorage.getItem("tokenId");
    $.ajax({
        url: 'http://pedder.meteorapp.com/novo-usuario',
        data: {
            nome: $('#nome').val(),
            login: $('#login').val(),
            senha: $('#password').val()
        },
        success: function(resposta) {
            resposta = JSON.parse(resposta);

            if (resposta[0].status == "error" && $('.toast').length == 0)
                Materialize.toast(resposta[0].msg, 2000, 'red-text');
            else
                window.location = "paginaInicial.html?token=" + userToken + "&userId=" + resposta[0].usuario._id;
        },
        error: function(erro) {
            var erroJson = JSON.parse(erro.responseText);
            if ($('.toast').length == 0)
                Materialize.toast(erroJson[0].msg, 3000, 'red-text');
        }
    })
});

$('.acao-login').click(function() {
    //userToken = $('#token').val();
    userToken = window.localStorage.getItem("tokenId");
    $.ajax({
        url: 'http://pedder.meteorapp.com/loga-usuario',
        data: {
            login: $('#login').val(),
            senha: $('#password').val()
        },
        success: function(resposta) {
            resposta = JSON.parse(resposta);
            if (resposta[0].status == "error" && $('.toast').length == 0)
                Materialize.toast(resposta[0].msg, 2000, 'red-text');
            else
                window.location = "paginaInicial.html?token=" + userToken + "&userId=" + resposta[0].usuario._id;

        },
        error: function(erro) {
            if ($('.toast').length == 0)
                Materialize.toast(erro.responseText, 3000, 'red-text');
        }
    });
});

$('a[href="#meusPedidos"]').click(function() {
    meusPedidos();
});

$('.redirectCadastro').click(function() {
    //userToken = $('#token').val();
    userToken = window.localStorage.getItem("tokenId");
    window.location = "cadastro.html?token=" + userToken;
});

function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
    window.plugins.PushbotsPlugin.initialize("5ae2632e1db2dc0baa09c7a3", {
        "android": {
            "sender_id": "989712426350"
        }
    });
    // Only with First time registration
    window.plugins.PushbotsPlugin.on("registered", function(token) {
        console.log("Registration Id:" + token);
    });

    //Get user registrationId/token and userId on PushBots, with evey launch of the app even launching with notification
    window.plugins.PushbotsPlugin.on("user:ids", function(data) {
        console.log("user:ids" + JSON.stringify(data));
        $('#token').val(data.token);
        window.localStorage.setItem("tokenId", data.token)
    });
}

function scanQrcode(blnFazPeido) {
    cordova.plugins.barcodeScanner.scan(function(resultado) {
            if (resultado.text) {
                $('#numero-mesa').val(resultado.text);
                $('#lblMesa').text("Mesa: " + resultado.text);
                $('#dadosUsuarioMesa').text("Mesa: " + resultado.text);

                if (blnFazPeido)
                    novoPedido();
                else
                    Materialize.toast('Mesa ' + resultado.text, 2000);
            }
        },
        function(erro) {
            Materialize.toast('Erro ' + erro, 2000, 'red-text');
        });
}

function dadosUsuario() {
    $.ajax({
        url: 'http://pedder.meteorapp.com/dados-usuario',
        data: {
            userId: window.location.href.split("&userId=")[1]
        },
        success: function(resposta) {
            resposta = JSON.parse(resposta);
            if (resposta[0].usuario) {
                $('#dadosUsuarioNome').text(resposta[0].usuario.nome);
                $('#dadosUsuarioEmail').text(resposta[0].usuario.login);
            }
        }
    });
}

function meusPedidos() {
    $.ajax({
        url: 'http://pedder.meteorapp.com/lista-pedido',
        data: {
            userId: window.location.href.split("&userId=")[1]
        },
        success: function(resposta) {
            resposta = JSON.parse(resposta);
            var html = "";
            if (resposta[0].pedidos.length > 0) {
                $("#meusPedidos").html("");
                html += '<ul class="collection">';
                for (var i = 0; i < resposta[0].pedidos.length; i++) {
                    html += '   <a class="collection-item  waves-effect black-text">';
                    if (resposta[0].pedidos[i].ativo) {
                        if (resposta[0].pedidos[i].status == 'Aguardando Aceite') {
                            html += '<p class="yellow-text text-darken-2 B">Pendente<i class="pedido-data">Atualizado em: ' + new Date(resposta[0].pedidos[i].dataUltimaAtualizacao).toLocaleString('pt-BR') + '</i></p>';
                        } else if (resposta[0].pedidos[i].status == 'Aceito') {
                            html += '<p class="green-text B">Em Preparo<i class="pedido-data">Atualizado em: ' + new Date(resposta[0].pedidos[i].dataUltimaAtualizacao).toLocaleString('pt-BR') + '</i></p>';
                            html += '<p style="display: flex;"><i class="material-icons" style="margin-right: 5px;">access_time</i>Tempo Estimado: ' + resposta[0].pedidos[i].tempoEstimado + ' min.</p>';
                        }
                    } else {
                        if (resposta[0].pedidos[i].status == 'Recusado') {
                            html += '<p class="red-text B">Recusado<i class="pedido-data">Atualizado em: ' + new Date(resposta[0].pedidos[i].dataUltimaAtualizacao).toLocaleString('pt-BR') + '</i></p>';
                            html += '<p style="display: flex;"><i class="material-icons" style="margin-right: 5px;">feedback</i>Motivo: ' + resposta[0].pedidos[i].motivoRecusa + '</p>';
                        } else if (resposta[0].pedidos[i].status == 'Finalizado') {
                            html += '<p class="blue-text B">Finalizado<i class="pedido-data">Atualizado em: ' + new Date(resposta[0].pedidos[i].dataUltimaAtualizacao).toLocaleString('pt-BR') + '</i></p>';
                        }
                    }
                    html += '<p>' + resposta[0].pedidos[i].itens + '</p>';
                    html += '<p style="font-weight: bold"> Total: ' + parseFloat(resposta[0].pedidos[i].preco.replace(/\./g, '').replace(',', '.')).toLocaleString('pt-BR', { minimumFractionDigits: 2 , style: 'currency', currency: 'BRL' }) + '</p>';
                    html += '   </a>';
                }
                html += '</div>';
            } else {
                html += '<div class="sem-pedidos-container center-align">';
                html += '   <div class="sem-pedidos">';
                html += '     Nenhum pedido realizado!';
                html += '   </div>';
                html += '</div>';
            }
            $("#meusPedidos").html(html);
        },
        error: function(erro) {
            Materialize.toast(erro.responseText, 3000, 'red-text');
        }
    });
}

function novoPedido() {
    $.ajax({
        url: 'http://pedder.meteorapp.com/novo-pedido',
        data: {
            mesa: $('#numero-mesa').val(),
            pedido: $('#resumo').html().replace(/<div>/g, "").replace(/<\/div>/g, "").replace(new RegExp("<br>$"), ""),
            userToken: window.localStorage.getItem("tokenId"),
            //userToken: window.location.href.split("?token=")[1].split("&")[0],
            userId: window.location.href.split("&userId=")[1],
            preco: $('#total').text().split("R$")[1]
        },
        success: function(resposta) {
            Materialize.toast(resposta, 2000, 'green-text');
            $('.badge').text("0");
        },
        error: function(erro) {
            Materialize.toast(erro.responseText, 3000, 'red-text');
        }
    });
}

function cardapio() {
    $.ajax({
        url: 'http://pedder.meteorapp.com/produtos',
        success: function(resposta) {

            if (resposta[0].produtos.length > 0) {
                var html = "";
                html += '<ul class="collection">';
                for (var i = 0; i < resposta[0].produtos.length; i++) {
                    html += '<li class="collection-item avatar waves-effect" style="padding-right: 0">';
                    html += '  		<div class="row" style="margin-bottom: 0;"><img src="' + resposta[0].produtos[i].image + '" alt="" class="circle" style="margin-left: 15px;">';
                    html += '   		<div class="col s12" style="text-align: right; padding-right: 25px; padding-top: 15px;"><i class="material-icons waves-effect waves-light waves-circle removeIcon">remove</i>';
                    html += '   			<span class="badge">0</span>';
                    html += '   			<i class="material-icons waves-effect waves-light waves-circle addIcon">add</i>';
                    html += '   		</div>';
                    html += '   	</div>';
                    html += '   	<div class="row rowDadosProduto"><span class="title">' + resposta[0].produtos[i].nome + '</span>';
                    html += '   		<p id="valor">' + resposta[0].produtos[i].descricao + ' <br>';
					var preco = resposta[0].produtos[i].preco.replace("R$ ", "").replace(/\./g, "").replace(',', '.');
                    html += 		 	parseFloat(preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 , style: 'currency', currency: 'BRL' });
                    html += '   		</p>';
                    html += '   	</div>';
                    html += '</li>';
                }
                html += '</ul>';

                $("#confirmar").removeClass("disabled");
                $('#cardapio div').remove();
                $('#cardapio').html(html);

                $('.collection-item').on('click', function(event) {
                    if ($(event.target).hasClass("addIcon") || $(event.target).hasClass("removeIcon"))
                        return;
                    var $badge = $('.badge', this);

                    if ($badge.text() == "0") {
                        $badge.text(0 + 1);
                    } else
                        $badge.text(parseInt($badge.text()) + 1);
                });

                $('.addIcon').on('click', function() {
                    var $badge = $('.badge', $(this).parent()[0]);
                    $badge.text(parseInt($badge.text()) + 1);
                });

                $('.removeIcon').on('click', function() {
                    var $badge = $('.badge', $(this).parent()[0]);
                    if (parseInt($badge.text()) > 0) {
                        $badge.text(parseInt($badge.text()) - 1);
                    }
                });
            } else {
                $('#cardapio .loading').remove();
                $('#cardapio .sem-produtos-container').css('display', 'table');
            }
        }
    });
}

$('.modal-trigger').leanModal();