function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

$(document).ready(function()
  {
    $('.eliminarRecurso').click(function(e) {
      e.preventDefault()
      var resposta = window.confirm('Tem a certeza que pretende eliminar este recurso?')
      
      if (resposta) $(this).closest("form").submit()
    })

    $('.classificarRecurso').click(function(e) {
      e.preventDefault()
      
      if ($('#nivelAutorizacao').val() == 'consumidor') {
        window.alert('Precisas de uma conta para classificar um recurso!')
      }
      else window.location = $(this).attr('href')
    })
    
    $('#resources_filter').one("click", function() {
      var tipos = JSON.parse($('#tipos').val())
      var autores = JSON.parse($('#autores').val())
      
      autocomplete(document.getElementById("search_type"), tipos);
      autocomplete(document.getElementById("search_author"), autores);
    })

    $('#resources_filter').change(function() {
      var tipo = $(this).val();
        
      if (tipo == 'titulo') {
          document.getElementById('search_title').style.display = 'block'
          document.getElementById('search_type').style.display = 'none'
          document.getElementById('search_author').style.display = 'none'
          document.getElementById('search_year').style.display = 'none'
      }
      if (tipo == 'tipo') {
          document.getElementById('search_title').style.display = 'none'
          document.getElementById('search_type').style.display = 'block'
          document.getElementById('search_author').style.display = 'none'
          document.getElementById('search_year').style.display = 'none'
      }
      if (tipo == 'autor') {
          document.getElementById('search_title').style.display = 'none'
          document.getElementById('search_type').style.display = 'none'
          document.getElementById('search_author').style.display = 'block'
          document.getElementById('search_year').style.display = 'none'
      }
      if (tipo == 'ano') {
          document.getElementById('search_title').style.display = 'none'
          document.getElementById('search_type').style.display = 'none'
          document.getElementById('search_author').style.display = 'none'
          document.getElementById('search_year').style.display = 'block'
      }

      document.getElementById('resources_searchbtn').style.display = 'block'
    })

    $('.ordenarRecursos').click(function(e) {
      e.preventDefault()

      var href = $(this).attr('href');
      var filtroAtual = $('#filtroAtual').val()
      var ordemAtual = $('#ordemAtual').val()
      var meus_recursos = $('#meus_recursos').is(":checked")

      if (!filtroAtual && !meus_recursos) {
        if (ordemAtual != href) {
          $('#formOrdenacao').attr('action', `/recursos/ordenar/${href}`)
          $('#formOrdenacao').submit()
        }
        else window.location = '/recursos'
      }
      else {
        if (ordemAtual != href) {
          $('#formOrdenacao').attr('action', `/recursos/ordenarFiltragem/${href}`)
          $('#formOrdenacao').submit()
        }
        else {
          $('#formOrdenacao').attr('action', `/recursos/ordenarFiltragem/dataUltimaMod/0`)
          $('#formOrdenacao').submit()
        }
      }
    })

    $('#meus_recursos').click(function() {
      $('#formPesquisa').submit()      
    })

    $('.recurso-checkbox').click(function() {
      var recursos = JSON.parse($('[name=selecionados]').val())
      var diretoria = $(this).closest("tr").attr('id')

      if($(this).is(':checked')) recursos.push(diretoria)
      else {
        var indice = recursos.indexOf(diretoria);
        if (indice > -1) recursos.splice(indice, 1);
      }

      $('[name=selecionados]').val(JSON.stringify(recursos)); 

      if ($('.recurso-checkbox:checkbox:checked').length > 0)
        $('#submit_download').prop('disabled', false)
      else $('#submit_download').prop('disabled', true)
    })
  })