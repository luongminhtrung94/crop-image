Dropzone.autoDiscover = false;
var myDropzone = new Dropzone("#attachment", { 
    url: "http://localhost:8000/uploads",
    uploadMultiple: false,
    method: 'POST',
    paramName : 'uploadfile',
});
myDropzone.on("addedfile", function(file) {
    console.log(file);
});
myDropzone.on('processing' , function(file , progress){
    console.log(file);
})

myDropzone.on('success' , function(file , rawResponse){
    console.log(rawResponse);
    myDropzone.emit('thumbnail' , file , "http://localhost:8000" + rawResponse.url)
});

// myDropzone.on('sending', function(file, xhr, formData){
//     formData.append('userName', 'bob');
// });