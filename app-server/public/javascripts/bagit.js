$(document).ready(function()
  {
    $('body').on('click', '#upload', function(e){
        e.preventDefault();

        var form = document.getElementById('myForm');
        $('.nova').remove()

        var formData = new FormData(form);
        var checksums = []
        var hashes = []
        var ficheiros = []
        var zip = new JSZip();

        for (var [key, value] of formData.entries()) {
          console.log("key:",key,"   value:",value)
          if (/^checksum/.test(key)) {
            checksums.push(key)
            hashes.push(value)
          }
          if(key == "material"){
           /* var extension = value.name.split(".")[1]
            if(extension=="xml"){
              console.log(value)
              $.ajax({
                url: "/materiais/libxmljs2/validateSessionXml",
                type: "POST",
                data: value,
                processData: false,
                contentType: false,
                success: function (response){
                  //window.location.replace("/materiais");
                  console.log("Resposta:",response)
                }
              });
            }
            else{*/
            zip.file("data/" + value.name, value)
            ficheiros.push(value.name)
            //}
          }
        }

        var manifest = getManifestString(hashes, ficheiros)
        zip.file("manifest-md5.txt",manifest)

        zip.generateAsync({type:'blob'}).then((blobdata)=>{
          //o zip chama-se blob
          formData.delete("material")
          for (var i = 0; i < checksums.length; i++) formData.delete(checksums[i])
          formData.append("zip",blobdata)
          
          $.ajax({
            url: "/materiais/upload",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response){
              window.location.replace("/materiais");
            }
          });
          // For development and testing purpose
            // create zip blob file
            // Download the zipped file 
            //let zipblob = new Blob([blobdata])
            //var elem = window.document.createElement("a")
            //elem.href = window.URL.createObjectURL(zipblob)
            //elem.download = 'compressed.zip'
            //elem.click()
        })
    })
})

function getChecksum(input, id){
    let file = input.files[0];

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function() {
      var hash = CryptoJS.MD5(reader.result).toString();
      $(`input[name = "checksum${id}"]`).val(hash)
    };

    reader.onerror = function() {
      console.log(reader.error);
    };
}

// returns the manifest
function getManifestString(hashes, ficheiros){
    var str = ''
    for(var i = 0; i < hashes.length; i++){
      str += `${hashes[i]} data/${ficheiros[i]}\n`
    }
    return str
}

// calculate the hash
function calculateMd5(blob, callback) {
    var reader = new FileReader();
    reader.readAsBinaryString(blob);
    reader.onloadend = function () {
      var  hash = CryptoJS.MD5(reader.result).toString();
      callback(hash);
    };
  }