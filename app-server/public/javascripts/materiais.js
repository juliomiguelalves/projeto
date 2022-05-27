function showFicheiro(f){
    if((f.mimetype == "image/png") || (f.mimetype == "image/jpeg")){
        var ficheiro = $('<img src="/ficheiros/'+ f.name + '" width="80%"/>') 
    }
    else
        var ficheiro = $('<p>'+JSON.stringify(f)+'</p>')
    
    var download = $('<div><a href="/download/'+f.name+'">Download</a></div>')
    $("#display").empty()
    $("#display").append(ficheiro,download)
    $("#display").modal()
}


function adicionarFicheiro(nr, operacao) {
    $('#novoFicheiro'+nr).click();
    $('#novoFicheiro'+nr).change(function () {
        if (this.files) {
            $('#linha'+nr).attr("class",'')
            var detalhes = this.files[0]

            $(`#linha${nr} .nome`).html(detalhes.name)
            $(`#linha${nr} .tamanho`).html(calcularTamanho(detalhes.size))

            var preview = '<button type="button" class="resource-btn" onclick="mostrarPreviewNovo('+nr+')"> 👁 </button>'
            $(`#linha${nr} .preview`).html(preview)

            $(`#linha${nr} button.adicionar`).css("display","none")
            $(`#linha${nr} button.remover`).css("display","inline-block")
            
            $(`#ficheiros-${operacao} tr:last`).after(adicionarLinha(nr+1, operacao))
        }
    })
}


function adicionarLinha(nr, operacao) {
    var html = `<tr id="linha${nr}" class="nova">
            <th class="nome"></th>
            <th class="tamanho"></th>
            <th class="preview"></th>
            <th>`
    
    if (operacao == 'upload') html += `<input hidden name="checksum${nr}" value="">`

    html += `   <button class="adicionar" type="button" onclick="adicionarFicheiro(${nr}, '${operacao}')"> &#10133; </button>
                <input name="recurso" type="file" id="novoFicheiro${nr}" `

    if (operacao == 'upload') html += `onchange='getChecksum(this,${nr})' ` 
    
    html += `style="display: none">
                <button class="remover" type="button" style="color: red; boder-radius: none; display: none" onclick="removerFicheiro('linha${nr}', '${operacao}')"> &#10006; </button>
            </th>
        </tr>`

    return html
}
function calcularTamanho(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    else {
      var kb = bytes/1024;
      if (kb < 1024) return `${(kb.toFixed(2))} KB`;
      else {
        var mb = kb/1024;
        if (mb < 1024) return `${(mb.toFixed(2))} MB`;
  
        return `${(mb/1024).toFixed(2)} GB`;
      }
    }
  }

  function removerFicheiro(id, operacao) {
    var nrLinhas = $(`#ficheiros-${operacao} tr`).length - 2 //th's e linha de adicionar recursos
    //if (nrLinhas == 1) window.alert('O recurso precisa de ter pelo menos 1 ficheiro!') 
    //else {
        if (operacao == 'edicao') {
            var removerFicheiros = JSON.parse($('#removerFicheiros').val())
            removerFicheiros.push(id)
            $('#removerFicheiros').val(JSON.stringify(removerFicheiros))
        }

        $('#'+id).remove()
    //}
}